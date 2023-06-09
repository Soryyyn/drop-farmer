import { SettingOwnerType } from '@df-types/settings.types';
import { getOwnersByType } from '@main/store/settings';
import { log } from '@main/util/logging';
import TwitchStreamer from './farms/twitchStreamer';
import YoutubeStream from './farms/youtubeStream';
import NewFarmTemplate from './newtemplate';

/**
 * The farms currently added in the app.
 * Get loaded in the init from the settings.
 */
const farms: NewFarmTemplate[] = [];

export function initFarmsManagement() {
    /**
     * Get the farms found from the settings.
     */
    const twitchFarms = getOwnersByType(SettingOwnerType.FarmTwitch);
    const youtubeFarms = getOwnersByType(SettingOwnerType.FarmYoutube);

    /**
     * Add the farms to the main array.
     */
    twitchFarms.forEach((farm) => farms.push(new TwitchStreamer(farm.name)));
    youtubeFarms.forEach((farm) => farms.push(new YoutubeStream(farm.name)));
    log('info', `Added all farms (${farms.length}) from settings to manager`);

    /**
     * Initialize the farms.
     */
    farms.forEach((farm) => farm.init());
}

/**
 * Get all farms.
 */
export function getFarms() {
    return farms;
}

/**
 * Get a farm by its name.
 */
export function getFarmByName(name: string) {
    return farms.find((farm) => farm.name === name);
}

/**
 * Stop a farm by its name.
 */
export function stopFarm(name: string) {
    getFarmByName(name)?.stop();
}

/**
 * Stop all farms.
 */
export function stopFarms() {
    farms.forEach((farm) => farm.stop());
}
