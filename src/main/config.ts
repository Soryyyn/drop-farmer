import AutoLaunch from "auto-launch";
import isEqual from "lodash.isequal";
import { getFarms } from "./farms/management";
import { createFile, readFile, writeToFile } from "./files/handling";
import { debugLogs, log } from "./util/logger";

const FILE_NAME = "config.json";
const DEFAULT_STRUCTURE: ConfigFile = {
    applicationSettings: {
        launchOnStartup: false,
        showMainWindowOnLaunch: true,
        disable3DModuleAnimation: false,
        debugLogs: false
    },
    farms: [],
}
const autoLauncher = new AutoLaunch({
    name: "drop-farmer"
});
let currentConfigData: ConfigFile = DEFAULT_STRUCTURE;

/**
 * Initialize the config file.
 */
export function initConfig(): void {
    createConfigFile();
    currentConfigData = addNotFoundEntries(readConfigFile(), DEFAULT_STRUCTURE);

    /**
     * Enable or disable the debug logs.
     */
    debugLogs(currentConfigData.applicationSettings.debugLogs);
}

/**
 * Create the config file.
 */
function createConfigFile(): void {
    try {
        createFile(FILE_NAME, JSON.stringify(DEFAULT_STRUCTURE, null, 4));
    } catch (err) {
        log("MAIN", "FATAL", `Failed creating config file. ${err}`);
    }
}

/**
 * Read the config file.
 */
function readConfigFile(): void {
    try {
        return JSON.parse(readFile(FILE_NAME));
    } catch (err) {
        log("MAIN", "FATAL", `Failed reading config file. ${err}`);
    }
}

/**
 * Add not found keys to the config file.
 *
 * @param readObject The newly read settings file.
 * @param defaultObject The default settings object.
 */
function addNotFoundEntries(readObject: any, defaultObject: any): any {
    let writtenAmount: number = 0;
    let newObjectToWrite = { ...readObject };

    /**
     * Add object entries to settings in config.
     */
    for (const [keys, value] of Object.entries(defaultObject)) {
        if (!Object.keys(readObject).includes(keys)) {
            newObjectToWrite[keys] = value;
            writtenAmount++;
        }
    }

    /**
     * Add not found farm entries which are needed.
     * NOTE: Use for migrating with new entries.
     */
    for (const farm of readObject.farms) {
        /**
         * Decide if the farm is a default farm.
         */
        let found: boolean = false;
        for (const defaultFarm of getFarms()) {
            if (farm.name === defaultFarm.getName()) {
                found = true;
            }
        }

        /**
         * If it is a default farm or if it is a custom farm.
         */
        if (found) {
            farm.type = "default";
        } else {
            farm.type = "custom";
        }
    }

    /**
     * Write the changes if needed to the file.
     */
    if (writtenAmount > 0) {
        writeToFile(FILE_NAME, JSON.stringify(newObjectToWrite, null, 4), "w");
        log("MAIN", "DEBUG", `Written ${writtenAmount} properties to settings file`);
        return readConfigFile();
    } else {
        return readObject;
    }
}

/**
 * Get the current application settings.
 */
export function getApplicationSettings(): ApplicationSettings {
    return currentConfigData.applicationSettings;
}

/**
 * Get the current app uptime.
 */
export function getAppUptime(): number {
    let tempUptime = 0;

    for (const farm of currentConfigData.farms)
        tempUptime += farm.uptime;

    return tempUptime;
}

/**
 * Get the current farms data.
 */
export function getFarmsData(): FarmSaveData[] {
    return currentConfigData.farms;
}

/**
 * Update the application settings.
 *
 * @param {ApplicationSettings} newApplicationSettings The new application
 * settings to set.
 */
export function updateApplicationSettings(newApplicationSettings: ApplicationSettings): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            /**
             * If at least one change happened do the write call.
             */
            if (!isEqual(newApplicationSettings, currentConfigData.applicationSettings)) {
                currentConfigData.applicationSettings = newApplicationSettings;

                debugLogs(newApplicationSettings.debugLogs);
                launchOnStartup(newApplicationSettings.launchOnStartup);
                writeToFile(FILE_NAME, JSON.stringify(currentConfigData, null, 4), "w");
                log("MAIN", "DEBUG", `Updated application settings in config`);
            }

            resolve(undefined);
        } catch (err) {
            log("MAIN", "ERROR", `Failed updating application settings. ${err}`);
            reject(err);
        }
    });
}

/**
 * Update the app and farms uptimes.
 */
function updateUptimes(): void {
    for (const farm of getFarms()) {
        for (let i = 0; i < currentConfigData.farms.length; i++) {
            if (farm.getName() === currentConfigData.farms[i].name) {
                /**
                 * Stop the timer and add up the times.
                 */
                farm.timerAction("stop");
                currentConfigData.farms[i].uptime += farm.getCurrentUptime();
            }
        }
    }
}

/**
 * Update the farms data.
 *
 * @param {FarmSaveData[]} newFarmsData The new farms data to set.
 */
export function updateFarmsData(newFarmsData: FarmSaveData[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        try {
            /**
             * Prematurely set the new farm config data even if nothing changed.
             */
            currentConfigData.farms = newFarmsData;

            /**
             * If at least one change happened do the write call.
             */
            let changed: boolean = false;

            for (const farm of getFarms()) {
                for (const newFarmData of newFarmsData) {
                    if (farm.getName() === newFarmData.name) {
                        /**
                         * Only apply new changes if the current settings
                         * differentiate from the new changes.
                         */
                        if (newFarmData.checkerWebsite !== farm.getFarmData().checkerWebsite ||
                            newFarmData.checkingSchedule !== farm.getFarmData().checkingSchedule ||
                            newFarmData.enabled !== farm.getFarmData().enabled) {
                            farm.applyNewSettings(newFarmData);
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                updateUptimes();
                writeToFile(FILE_NAME, JSON.stringify(currentConfigData, null, 4), "w");
                log("MAIN", "DEBUG", `Updated farms data in config`);
            }

            resolve(undefined);
        } catch (err) {
            log("MAIN", "ERROR", `Failed updating farms data. ${err}`);
            reject(err);
        }
    });
}

/**
 * Enable or disable the app launch on system startup.
 *
 * @param {boolean} launchOnStartup The launchOnStartup setting to set.
 */
function launchOnStartup(launchOnStartup: boolean): void {
    autoLauncher.isEnabled()
        .then((isEnabled: boolean) => {
            if (launchOnStartup) {
                if (!isEnabled) {
                    autoLauncher.enable();
                    log("MAIN", "INFO", "Enabled launch on startup");
                }
            } else {
                if (isEnabled) {
                    autoLauncher.disable();
                    log("MAIN", "INFO", "Disabled launch on startup");
                }
            }
        })
        .catch((err) => {
            log("MAIN", "ERROR", `Failed to change the launch on startup setting. ${err}`);
        });
}

/**
 * Save the current runtime config to the config file on app close.
 */
export function saveCurrentDataOnQuit(): void {
    updateUptimes();
    try {
        writeToFile(FILE_NAME, JSON.stringify(currentConfigData, null, 4), "w");
        log("MAIN", "DEBUG", "Wrote runtime config to file");
    } catch (err) {
        log("MAIN", "ERROR", `Failed to write runtime config to file. ${err}`);
    }
}