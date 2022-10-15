import set from "lodash.set";
import { log } from "./logger";

/**
 * The settings for the application.
 */
export const applicationSettings: Setting[] = [
    {
        name: "launchOnStartup",
        description: "Enable or disable if drop-farmer should be started when your PC has finished booting.",
        value: undefined,
        defaultValue: false
    },
    {
        name: "showMainWindowOnLaunch",
        description: "If the main window should be shown when drop-farmer starts.",
        value: undefined,
        defaultValue: true
    },
    {
        name: "disable3DModuleAnimation",
        description: "Disable the 3D models animation on various pages (Home, etc.).",
        value: undefined,
        defaultValue: false
    },
    {
        name: "debugLogs",
        description: "Enable the debug logs. Use for debugging or reporting errors.",
        value: undefined,
        defaultValue: false
    },
];

/**
 * The settings for each specific farm.
 */
export const specificFarmSettings: Setting[] = [
    {
        name: "enabled",
        description: "Enable or disable this farm.",
        value: undefined,
        defaultValue: false
    },
    {
        name: "checkerWebsite",
        description: "The website drop-farmer checks for the schedule, live matches, etc. to start farming.",
        value: undefined,
        defaultValue: ""
    },
    {
        name: "checkingSchedule",
        description: "The schedule (in minutes) on which drop-farmer will check if farming is possible.",
        value: undefined,
        defaultValue: 30
    }
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
 * @param {Settings} settings The new settings object to apply.
 * @returns {Settings} The newly updated settings to write.
 */
export function updateSettings(newSettings: Settings): Settings {
    settings = newSettings;
    return settings;
}

/**
 * Convert a cached setting to the setting usable by the app.
 *
 * @param {CachedSetting} cached The setting to get the cached data from.
 * @param {string} settingOwner The owner of the setting. May be "application"
 * or any other farm name.
 */
export function loadCachedIntoSettings(cached: CachedSetting, settingOwner: string): void {
    /**
     * Go through each setting and find the cached one.
     */
    for (const [key, value] of Object.entries(settings)) {
        if (key === settingOwner) {
            value.forEach((setting: Setting) => {
                /**
                 * Load the cached value into the setting of the runtime.
                 */
                if (setting.name === cached.name) {
                    setting.value = cached.value;
                }
            });
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
            set(converted, `${key}.${setting.name}`, setting.value ?? setting.defaultValue);
        });
    }

    log("MAIN", "DEBUG", "Converted runtime settings to cached settings");
    return converted;
}