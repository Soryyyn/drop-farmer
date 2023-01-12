import { EventChannels, IpcChannels } from '@main/common/constants';
import { handleAndReply, sendOneWay } from '@main/electron/ipc';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import {
    doesSettingExist,
    getSetting,
    setSetting,
    updateSetting
} from '@main/util/settings';
import LeagueOfLegends from './farms/leagueOfLegends';
import YoutubeStream from './farms/youtubeStream';
import FarmTemplate from './template';

const farms: FarmTemplate[] = [];
const defaultFarms: FarmTemplate[] = [
    new LeagueOfLegends(),
    new YoutubeStream(
        'overwatch-league',
        'Overwatch: League',
        'https://www.youtube.com/c/overwatchleague'
    ),
    new YoutubeStream(
        'overwatch-contenders',
        'Overwatch: Contenders',
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

handleAndReply(IpcChannels.addNewFarm, (event, farm: NewFarm) => {
    switch (farm.type) {
        case 'youtube':
            farms.push(
                new YoutubeStream(farm.id, farm.shown, farm.url, farm.schedule)
            );
            break;
    }

    const addedFarm = farms[farms.length - 1];
    addedFarm.initialize();

    /**
     * Enable the wanted disabled settings.
     */
    if (!doesSettingExist(addedFarm.id, 'url')) {
        const settingToBeUpdated = getSetting(addedFarm.id, 'url');
        updateSetting(addedFarm.id, 'url', {
            ...settingToBeUpdated!,
            disabled: false
        });
    }
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
        shown: event[0].shown,
        needed: event[0].needed
    });
});
