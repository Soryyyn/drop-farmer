import { EventChannels, IpcChannels } from '@main/common/constants';
import { handleOneWay, sendOneWay } from '@main/electron/ipc';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    deleteSettingsOfOwner,
    getSetting,
    getSettings,
    updateSetting
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

function addDefaultFarms(): void {
    farms.push(...defaultFarms);
}

function addUserAddedFarms(): void {}

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
    farms.forEach((farm) => farm.destroyAllWindows());
}

export function stopAllFarmJobs(): void {
    farms.forEach((farm) => farm.scheduler.stopAll());
}

export function stopAllTimers(): void {
    farms.forEach((farm) => farm.timer.stopTimer());
}

function deleteFarm(id: string): void {
    /**
     * Delete the farm from the management.
     */
    const index = farms.findIndex((farm) => farm.id === id);
    farms[index].timer.stopTimer();
    farms[index].scheduler.stopAll();
    farms[index].destroyAllWindows();
    farms.splice(index, 1);

    /**
     * Delete the settings of the farm.
     */
    deleteSettingsOfOwner(id);

    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getSettings());
}

function addNewFarm(farm: NewFarm): void {
    switch (farm.type) {
        case 'youtube':
            farms.push(
                new YoutubeStream(farm.id, false, farm.url, farm.schedule)
            );
            break;
        case 'twitch':
            farms.push(
                new TwitchStreamer(farm.id, false, farm.url, farm.schedule)
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

    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getSettings());
}

handleOneWay(IpcChannels.addNewFarm, (event, farm: NewFarm) => {
    addNewFarm(farm);
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
    farms.forEach((farm) => farm.scheduler.startAll());
});

listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject[]) => {
    sendOneWay(IpcChannels.farmLogin, {
        id: event[0].id,
        needed: event[0].needed
    });
});
