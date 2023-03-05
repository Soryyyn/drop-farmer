import { EventChannels, RegularExpressions } from '@main/common/constants';
import {
    getTypeFromText,
    isValidURL,
    removeTypeFromText
} from '@main/common/string.helper';
import { formattedStringToDate } from '@main/util/calendar';
import { emitEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    deleteAllOwnerSettings,
    getSettings,
    getSettingValue,
    setSettingValue
} from '@main/util/settings';
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
            if (id && id === farm.id) {
                await farm.stop();
            }

            await farm.stop();
        });

        log('info', 'Stopped all farms');
        resolve();
    });
}

/**
 * Delete a farm by id.
 */
export async function deleteFarm(id: string) {
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
export async function addNewFarm(farm: NewFarm): Promise<void> {
    const validation = validateNewFarm(farm);

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
