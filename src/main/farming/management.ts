import {
    EventChannels,
    IpcChannels,
    RegularExpressions,
    Toasts
} from '@main/common/constants';
import {
    getTypeFromText,
    isValidURL,
    removeTypeFromText
} from '@main/common/string.helper';
import { handleAndReply, handleOneWay, sendOneWay } from '@main/electron/ipc';
import { formattedStringToDate, ISOStringToDate } from '@main/util/calendar';
import { emitEvent, listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import { connectToElectron } from '@main/util/puppeteer';
import {
    deleteAllOwnerSettings,
    getMergedSettings,
    getSettings,
    getSettingValue,
    setSettingValue
} from '@main/util/settings';
import { sendToast } from '@main/util/toast';
import LeagueOfLegends from './farms/leagueOfLegends';
import TwitchStreamer from './farms/twitchStreamer';
import YoutubeStream from './farms/youtubeStream';
import FarmTemplate from './template';

const farms: FarmTemplate[] = [];
const defaultFarms: FarmTemplate[] = [
    new LeagueOfLegends(),
    new YoutubeStream(
        'Overwatch: League',
        true,
        'https://www.youtube.com/c/overwatchleague'
    ),
    new YoutubeStream(
        'Overwatch: Contenders',
        true,
        'https://www.youtube.com/c/OverwatchContenders'
    )
];

export function initFarmsManagement(): void {
    addDefaultFarms();
    addUserAddedFarms();

    initializeFarmSettings();
}

/**
 * Add the default farms from the array to the actual farms.
 */
function addDefaultFarms(): void {
    farms.push(...defaultFarms);
}

/**
 * Add the custom farms found in the settings file to the farms array.
 */
function addUserAddedFarms(): void {
    const settings = getSettings();

    /**
     * Go through each settings entry and find non-default farms and create the
     * farm instances.
     */
    for (const [farmId, value] of Object.entries(settings)) {
        let isDefault = false;
        defaultFarms.forEach((farm) => {
            if (farmId === farm.id) {
                isDefault = true;
            }
        });

        if (!isDefault) {
            switch (getTypeFromText(farmId)) {
                case 'youtube':
                    farms.push(
                        new YoutubeStream(
                            removeTypeFromText(farmId),
                            false,
                            getSettingValue(farmId, 'farm-url')! as string,
                            getSettingValue(farmId, 'farm-schedule')! as number
                        )
                    );
                    break;
                case 'twitch':
                    farms.push(
                        new TwitchStreamer(
                            removeTypeFromText(farmId),
                            false,
                            getSettingValue(farmId, 'farm-url')! as string,
                            getSettingValue(farmId, 'farm-schedule')! as number
                        )
                    );
                    break;
            }
        }
    }
}

/**
 * Initialize all farms.
 */
function initializeFarmSettings(): void {
    farms.forEach(async (farm) => await farm.initialize());
}

/**
 * Apply new settigns to all farms.
 */
export function applySettingsToFarms(): void {
    farms.forEach(async (farm) => await farm.applyNewSettings());
}

/**
 * Get all farms.
 */
export function getFarms(): FarmTemplate[] {
    return farms;
}

/**
 * Get a farm by their id.
 */
export function getFarmById(id: string): FarmTemplate | undefined {
    return farms.find((farm) => farm.id === id);
}

export function getFarmsRendererData(): FarmRendererData[] {
    return farms.map((farm) => farm.getRendererData());
}

/**
 * Stop all farms and their things.
 */
export function stopFarms(id?: string): Promise<void> {
    return new Promise((resolve) => {
        farms.forEach(async (farm) => {
            if (id === farm.id) {
                farm.scheduler.stopAll();

                farm.timer.stopTimer();
                farm.updateConditions();

                await farm.destroyAllWindows();

                log('info', `Stopped farm ${farm.id}`);
                resolve();
            }

            farm.scheduler.stopAll();

            farm.timer.stopTimer();
            farm.updateConditions();

            await farm.destroyAllWindows();
        });

        log('info', 'Stopped all farms');
        resolve();
    });
}

/**
 * Delete a farm by id.
 */
async function deleteFarm(id: string) {
    const index = farms.findIndex((farm) => farm.id === id);
    await stopFarms(id);
    farms.splice(index, 1);

    deleteAllOwnerSettings(id);

    /**
     * Notify event handler that farms changed.
     */
    emitEvent(EventChannels.FarmsChanged, null);

    log('info', `Deleted farm ${id}`);
}

/**
 * Validate the data given from renderer.
 */
function validateNewFarm(farm: NewFarm): Error | undefined {
    /**
     * Validate the url.
     */
    let urlTest = false;
    switch (farm.type) {
        case 'youtube':
            urlTest = isValidURL(farm.url, RegularExpressions.YoutubeChannel);
            break;
        case 'twitch':
            urlTest = isValidURL(farm.url, RegularExpressions.TwitchChannel);
            break;
    }

    /**
     * If the from and to date are given.
     */
    let dateTest = false;
    if (
        (farm.conditions.condition as TimeWindowCondition).from &&
        (farm.conditions.condition as TimeWindowCondition).to
    ) {
        /**
         * Check if the from date is before the to date.
         */
        if (
            formattedStringToDate(
                (farm.conditions.condition as TimeWindowCondition).from!
            ) <
            formattedStringToDate(
                (farm.conditions.condition as TimeWindowCondition).to!
            )
        ) {
            dateTest = true;
        } else {
            dateTest = false;
        }
    } else {
        dateTest = true;
    }

    /**
     * Check if all tests succeeded.
     */
    if (urlTest) {
        if (!dateTest) {
            return new Error(
                'The "From" or/and "To" date are not valid. Also make sure the "From" date is before the "To" date.'
            );
        }
    } else {
        return new Error(
            "The URL defined doesn't match the farming location given or is not a valid URL."
        );
    }
}

/**
 * Add a new farm with data given.
 */
async function addNewFarm(farm: NewFarm): Promise<void> {
    const validation = validateNewFarm(farm);

    console.log(farm);

    if (validation === undefined) {
        switch (farm.type) {
            case 'youtube':
                farms.push(
                    new YoutubeStream(
                        farm.id,
                        false,
                        farm.url,
                        farm.schedule,
                        farm.conditions
                    )
                );
                break;
            case 'twitch':
                farms.push(
                    new TwitchStreamer(
                        farm.id,
                        false,
                        farm.url,
                        farm.schedule,
                        farm.conditions
                    )
                );
                break;
        }

        /**
         * Get newly created farm.
         */
        const newFarm = farms[farms.length - 1];

        /**
         * Initialize the newly added farm.
         */
        await newFarm.initialize();

        /**
         * Enable changing of URLs.
         */
        setSettingValue(newFarm.id, 'farm-url', {
            value: farm.url,
            disabled: false
        });

        await newFarm.applyNewSettings();

        /**
         * Notify about changed farms.
         */
        emitEvent(EventChannels.FarmsChanged, null);

        log('info', `Added new farm ${farm.id}`);
    } else {
        throw validation;
    }
}

handleOneWay(IpcChannels.addNewFarm, async (event, farm: NewFarm) => {
    sendToast(
        {
            id: Toasts.FarmCreation,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Successfully created farm ${removeTypeFromText(
                farm.id
            )}`,
            textOnLoading: `Creating farm ${removeTypeFromText(farm.id)}...`,
            textOnError: `Failed creating farm`
        },
        undefined,
        addNewFarm(farm)
    );
});

handleOneWay(IpcChannels.deleteFarm, (event, id) => {
    sendToast(
        {
            id: Toasts.FarmDeletion,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Successfully deleted farm ${removeTypeFromText(
                id
            )}`,
            textOnLoading: `Deleting farm ${removeTypeFromText(id)}...`,
            textOnError: `Failed deleting farm`
        },
        undefined,
        deleteFarm(id)
    );
});

handleOneWay(IpcChannels.resetFarmingConditions, async (event, id) => {
    const farm = getFarmById(id);

    sendToast(
        {
            id: Toasts.FarmResetConditions,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Reset farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}`,
            textOnError: `Failed resetting farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}`,
            textOnLoading: `Resetting farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}...`
        },
        undefined,
        new Promise((resolve, reject) => {
            try {
                farm?.restartScheduler();
                farm?.resetConditions();

                resolve(undefined);
            } catch (error) {
                reject(error);
            }
        })
    );
});

handleAndReply(IpcChannels.getFarms, () => {
    return getFarmsRendererData();
});

listenForEvent(EventChannels.PCWentToSleep, async () => {
    log('warn', 'Stopping farms because PC went to sleep');
    await stopFarms();
});

listenForEvent(EventChannels.PCWokeUp, async () => {
    log('warn', 'Starting farms again because PC woke up');

    /**
     * Reconnect puppeteer to electron.
     */
    await connectToElectron();

    farms.forEach(async (farm) => await farm.restartScheduler());
});

listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject[]) => {
    sendOneWay(IpcChannels.farmLogin, {
        id: event[0].id,
        needed: event[0].needed
    });
});

/**
 * Once farms changed notify renderer about new settings and farms.
 */
listenForEvent(EventChannels.FarmsChanged, () => {
    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getMergedSettings());
});
