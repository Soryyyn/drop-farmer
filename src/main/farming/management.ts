import { EventChannels, IpcChannels, Toasts } from '@main/common/constants';
import {
    getTypeFromText,
    removeTypeFromText
} from '@main/common/stringManipulation';
import { handleAndReply, handleOneWay, sendOneWay } from '@main/electron/ipc';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    deleteSettingsOfOwner,
    getSetting,
    getSettings,
    updateSetting
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

function addDefaultFarms(): void {
    farms.push(...defaultFarms);
}

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
                            getSetting(farmId, 'url')!.value as string,
                            getSetting(farmId, 'schedule')!.value as number
                        )
                    );
                    break;
                case 'twitch':
                    farms.push(
                        new TwitchStreamer(
                            removeTypeFromText(farmId),
                            false,
                            getSetting(farmId, 'url')!.value as string,
                            getSetting(farmId, 'schedule')!.value as number
                        )
                    );
                    break;
            }
        }
    }
}

function initializeFarmSettings(): void {
    farms.forEach((farm) => farm.initialize());
}

export function applySettingsToFarms(): void {
    farms.forEach((farm) => farm.applyNewSettings());
}

export function getFarms(): FarmTemplate[] {
    return farms;
}

export function getFarmById(id: string): FarmTemplate | undefined {
    return farms.find((farm) => farm.id === id);
}

export function getFarmsRendererData(): FarmRendererData[] {
    return farms.map((farm) => farm.getRendererData());
}

export function destroyAllFarmWindows(): void {
    farms.forEach(async (farm) => await farm.destroyAllWindows());
    log('info', 'Destroyed all windows');
}

export function stopAllFarmJobs(): void {
    farms.forEach((farm) => farm.scheduler.stopAll());
    log('info', 'Stopped all farm jobs');
}

export function stopAllTimers(): void {
    farms.forEach((farm) => farm.timer.stopTimer());
    log('info', 'Stopped all farm timers');
}

async function deleteFarm(id: string) {
    /**
     * Delete the farm from the management.
     */
    const index = farms.findIndex((farm) => farm.id === id);
    farms[index].timer.stopTimer();
    farms[index].scheduler.stopAll();
    await farms[index].destroyAllWindows();
    farms.splice(index, 1);

    /**
     * Delete the settings of the farm.
     */
    deleteSettingsOfOwner(id);

    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getSettings());
}

function addNewFarm(farm: NewFarm): FarmRendererData[] {
    validateNewFarm(farm);

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

    const addedFarm = farms[farms.length - 1];
    addedFarm.initialize();

    /**
     * Enable the wanted disabled settings.
     */
    const settingToBeUpdated = getSetting(addedFarm.id, 'url');
    updateSetting(addedFarm.id, 'url', {
        ...settingToBeUpdated!,
        default: farm.url,
        disabled: false
    });

    sendOneWay(IpcChannels.settingsChanged, getSettings());
    return getFarmsRendererData();
}

function validateNewFarm(farm: NewFarm): void {
    /**
     * Validate url.
     */
    let urlOk = false;
    let regex;

    switch (farm.type) {
        case 'twitch':
            regex = new RegExp(
                /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
            );
            break;
        case 'youtube':
            regex = new RegExp(
                /http(s)?:\/\/(www|m).youtube.com\/((channel|c)\/)?(?!feed|user\/|watch\?)([a-zA-Z0-9-_.])*.*/
            );
            break;
    }

    urlOk = regex.test(farm.url);

    /**
     * More checks in the future?
     */
    if (!urlOk) {
        throw new Error(
            'URL is not a valid channel URL for the given farm type'
        );
    }
}

handleAndReply(IpcChannels.addNewFarm, (event, farm: NewFarm) => {
    try {
        sendToast({
            id: Toasts.FarmCreation,
            type: 'success',
            duration: 4000,
            textOnSuccess: `Successfully created farm ${farm.id}`
        });
        return addNewFarm(farm);
    } catch (error) {
        sendToast({
            id: Toasts.FarmCreation,
            type: 'error',
            duration: 4000,
            textOnError: `Failed creating farm (${error})`
        });
        return undefined;
    }
});

handleOneWay(IpcChannels.deleteFarm, (event, id) => {
    deleteFarm(id);
});

listenForEvent(EventChannels.PCWentToSleep, () => {
    log(
        'warn',
        'Stopping farms and destroying windows because PC went to sleep'
    );
    stopAllFarmJobs();
    stopAllTimers();
    destroyAllFarmWindows();
});

listenForEvent(EventChannels.PCWokeUp, () => {
    log('warn', 'Starting farms again because PC woke up');
    farms.forEach(async (farm) => await farm.restartScheduler());
});

listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject[]) => {
    sendOneWay(IpcChannels.farmLogin, {
        id: event[0].id,
        needed: event[0].needed
    });
});
