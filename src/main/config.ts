import AutoLaunch from "auto-launch";
import { getFarms } from "./farmsManagement";
import { createFile, readFile, writeToFile } from "./fileHandling";
import { log } from "./logger";

const FILE_NAME = "config.json";
const DEFAULT_STRUCTURE: ConfigFile = {
    appUptime: 0,
    applicationSettings: {
        launchOnStartup: false,
        showMainWindowOnLaunch: true,
        disable3DModuleAnimation: false,
    },
    farms: [],
}
const autoLauncher = new AutoLaunch({
    name: "drop-farmer"
});
let currentConfigData: ConfigFile;

/**
 * Initialize the config file.
 */
export function initConfig(): void {
    createConfigFile();
    currentConfigData = addNotFoundEntries(readConfigFile(), DEFAULT_STRUCTURE);
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

    for (const [keys, value] of Object.entries(defaultObject)) {
        if (!Object.keys(readObject).includes(keys)) {
            newObjectToWrite[keys] = value;
            writtenAmount++;
        }
    }

    if (writtenAmount > 0) {
        writeToFile(FILE_NAME, JSON.stringify(newObjectToWrite, null, 4), "w");
        log("MAIN", "INFO", `Written ${writtenAmount} properties to settings file`);
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
    return currentConfigData.appUptime;
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
            currentConfigData.applicationSettings = newApplicationSettings;

            launchOnStartup(newApplicationSettings.launchOnStartup);

            log("MAIN", "INFO", `Updated application settings in config`);
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
                currentConfigData.farms[i].uptime += farm.getCurrentUptime();
                currentConfigData.appUptime += farm.getCurrentUptime();
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
            currentConfigData.farms = newFarmsData;

            for (const farm of getFarms()) {
                for (const newFarmData of newFarmsData) {
                    if (farm.getName() === newFarmData.name) {
                        farm.applyNewSettings(newFarmData);
                    }
                }
            }

            /**
             * Set the uptime of the farm.
             */
            updateUptimes();

            log("MAIN", "INFO", `Updated farms data in config`);
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
                if (isEnabled) {
                    log("MAIN", "INFO", "Launch on startup is already enabled");
                } else {
                    autoLauncher.enable();
                    log("MAIN", "INFO", "Enabled launch on startup");
                }
            } else {
                if (isEnabled) {
                    autoLauncher.disable();
                    log("MAIN", "INFO", "Disabled launch on startup");
                } else {
                    log("MAIN", "INFO", "Launch on startup is disabled");
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
        log("MAIN", "INFO", "Wrote runtime config to file");
    } catch (err) {
        log("MAIN", "ERROR", `Failed to write runtime config to file. ${err}`);
    }
}