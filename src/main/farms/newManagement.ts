import { EventChannels } from '../common/constants';
import { listenForEvent } from '../util/events';
import { log } from '../util/logger';
import LeagueOfLegends from './leagueOfLegends';
import NewFarmTemplate from './newTemplate';
import OverwatchContenders from './overwatchContenders';
import OverwatchLeague from './overwatchLeague';

const farms: NewFarmTemplate[] = [];
const defaultFarms: NewFarmTemplate[] = [
    new LeagueOfLegends(),
    new OverwatchLeague(),
    new OverwatchContenders()
];

export function initFarmsManagement(): void {
    addDefaultFarms();
    initializeFarmSettings();
}

function addDefaultFarms(): void {
    farms.push(...defaultFarms);
}

function initializeFarmSettings(): void {
    farms.forEach((farm) => farm.initialize());
}

export function applyNewSettingsToFarms(): void {
    farms.forEach((farm) => farm.applyNewSettings());
}

export function getFarms(): NewFarmTemplate[] {
    return farms;
}

export function getFarmById(id: string): NewFarmTemplate | undefined {
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

listenForEvent(EventChannels.PCWentToSleep, () => {
    log('MAIN', 'WARN', 'Stopping farms because PC went to sleep');
    farms.forEach((farm) => {
        farm.scheduler.stopAll();
        farm.destroyAllWindows();
    });
});

listenForEvent(EventChannels.PCWentToSleep, () => {
    log('MAIN', 'WARN', 'Restarting farms because PC woke back up');
    farms.forEach((farm) => {
        farm.restartScheduler();
    });
});
