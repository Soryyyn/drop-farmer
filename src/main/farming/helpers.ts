import { doesSettingExist, getSetting, setSetting } from '@main/util/settings';

/**
 * Get a setting for the farm or create the setting and return it.
 */
export function getOrSetSetting(
    id: string,
    setting: string,
    toCreate?: Setting
) {
    if (doesSettingExist(id, setting)) {
        return getSetting(id, setting)?.value;
    } else {
        if (toCreate) {
            setSetting(id, toCreate);
            return toCreate;
        }
    }
}
