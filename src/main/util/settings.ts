import set from "lodash.set";
import { getConfigKey, launchOnStartup, updateKeyValue } from "../config";
import { log } from "./logger";

/**
 * The settings for the application.
 */
export const applicationSettings: Setting[] = [
    {
        name: "launchOnStartup",
        shownName: "Launch on startup",
        description: "Enable or disable if drop-farmer should be started when your PC has finished booting.",
        value: undefined,
        defaultValue: false
    },
    {
        name: "showMainWindowOnLaunch",
        shownName: "Show main window on launch",
        description: "If the main window should be shown when drop-farmer starts.",
        value: undefined,
        defaultValue: true
    },
    {
        name: "disable3DModelAnimation",
        shownName: "Disable 3D model animation",
        description: "Disable the 3D models animation on various pages (Home, etc.).",
        value: undefined,
        defaultValue: false
    },
    {
        name: "debugLogs",
        shownName: "Enable debug logs",
        description: "Enable the debug logs. Use for debugging or reporting errors.",
        value: undefined,
        defaultValue: false
    },
];

/**
 * All of the settings set by key of owner.
 */
let settings: Settings = {
    application: applicationSettings,
}

/**
 * Returns the settings.
 */
export function getSettings(): Settings {
    return settings;
}

/**
 * Update the settings as a whole.
 *
 * @param {Settings} key The key to update / add.
 */
export function updateSettings(key: string, value: Setting[]): void {
    set(settings, key, value);

    /**
     * Update the launch on startup if the settings changed.
     */
    launchOnStartup(Boolean(getSpecificSetting("application", "launchOnStartup").value));
}

/**
 * Convert a cached setting to the setting usable by the app.
 */
export function loadCachedIntoSettings(): void {
    let cachedSettings: CachedSettings = getConfigKey("settings");

    /**
     * Go through each setting and find the cached one.
     */
    for (const [settingsKey, settingsValue] of Object.entries(settings)) {
        for (const [cachedKey, cachedValue] of Object.entries(cachedSettings)) {
            if (settingsKey === cachedKey) {
                settingsValue.forEach((setting: Setting) => {
                    /**
                     * Load the cached value into the setting of the runtime.
                     */
                    for (const [cachedSettingKey, cachedSettingValue] of Object.entries(cachedValue)) {
                        if (setting.name == cachedSettingKey)
                            setting.value = cachedSettingValue;
                    }
                });
            }
        }
    }

    log("MAIN", "DEBUG", "Loaded cached settings into runtime settings");
}

/**
 * Save or override the runtime settings to the config file for caching.
 */
export function convertSettingsIntoCached(): CachedSettings {
    let converted: CachedSettings = {};

    for (const [key, value] of Object.entries(settings)) {
        /**
         * Only add owner keys if they haven't already been added.
         */
        if (converted[key] == undefined) {
            converted[key] = {};
        }

        /**
         * Add all settings to the defined key object.
         * Set the default value if the value of the setting is undefined.
         */
        value.forEach((setting: Setting) => {
            set(converted, `${key}.${setting.name}`, (setting.value == undefined) ? setting.defaultValue : setting.value);
        });
    }

    return converted;
}

/**
 * Get a specific setting by the setting owner and the setting name.
 *
 * @param {string} settingOwner The owner of the setting. ex. "application".
 * @param {string} nameOfSetting The name of the setting to get.
 */
export function getSpecificSetting(settingOwner: string, nameOfSetting: string): Setting {
    let index = settings[settingOwner].findIndex((setting) => {
        return setting.name === nameOfSetting
    });

    return settings[settingOwner][index];
}