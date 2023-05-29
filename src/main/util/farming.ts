import {
    SettingId,
    SettingOwnerType,
    SettingUnion
} from '@df-types/settings.types';
import TwitchStreamer from '@main/farming/farms/twitchStreamer';
import YoutubeStream from '@main/farming/farms/youtubeStream';
import FarmTemplate from '@main/farming/template';
import { createSettingsOwner, getOrSetSetting } from '@main/store/settings';
import { log } from './logging';

/**
 * Create the settings for the given farm.
 */
export function createFarmSettings(farm: FarmTemplate) {
    /**
     * Decide on the type of the farm based on what class it instances.
     */
    if (farm instanceof YoutubeStream) {
        createSettingsOwner(farm.id, SettingOwnerType.FarmYoutube);
    } else if (farm instanceof TwitchStreamer) {
        createSettingsOwner(farm.id, SettingOwnerType.FarmTwitch);
    } else {
        log(
            'warn',
            "Can't create settings for farm which is not an allowed type"
        );
        return;
    }

    /**
     * Create the base settings.
     */
    getOrSetSetting(farm.id, SettingId.Enabled);
    getOrSetSetting(farm.id, SettingId.Schedule);
    getOrSetSetting(farm.id, SettingId.URL);
    getOrSetSetting(farm.id, SettingId.URL);
}

/**
 * Apply the wanted settings to the given farm.
 */
export function applySettingsToFarm(
    farm: FarmTemplate,
    settings: SettingUnion[]
) {}
