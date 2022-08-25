import { createFile, readFile, writeToFile } from "./fileHandling";
import { log } from "./logger";

let currentSettings: SettingsFile | undefined;
const FILE_NAME: string = "settings.json";
const DEFAULT_SETTINGS: SettingsFile = {
    launchOnStartup: false
};


/**
 * Read the settings file and save it in the current settings object.
 */
export function initSettings(): void {
    createSettingsFile();
    currentSettings = readSettingsFile();
}

/**
 * Write a new default settigns file into the
 * application directory.
 */
function createSettingsFile(): void {
    try {
        createFile(FILE_NAME, JSON.stringify(DEFAULT_SETTINGS, null, 4));
    } catch (err) {
        log("MAIN", "FATAL", `Failed creating settings file. Exiting drop-farmer. Error message:\n\t"${err}"`);
    }
}

/**
 * Read the settings file from the set filepath.
 * Also checks if the settings file exists,
 * if not it creates a new default one.
 */
function readSettingsFile(): SettingsFile | undefined {
    try {
        return JSON.parse(readFile(FILE_NAME));
    } catch (err) {
        log("MAIN", "ERROR", `Failed reading settings file. Using default settings. App functions may not work properly. Error message:\n\t"${err}"`);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Get the current settings.
 * Also re-reads the settings file to get actual
 * *current** settings.
 */
export function getCurrentSettings(): SettingsFile {
    currentSettings = readSettingsFile();
    return currentSettings! as SettingsFile;
}

/**
 * Cache the new user made changes to the app settings.
 *
 * @param {SettingsFile} changes The user made changes.
 */
export function cacheNewUserSettings(changes: SettingsFile): void {
    try {
        log("MAIN", "INFO", "Writing changed app settings from user to file");

        /**
         * Set the new changes.
         */
        currentSettings = changes;

        /**
         * Save the changes to the settings file.
         */
        writeToFile(FILE_NAME, JSON.stringify(currentSettings, null, 4), "w");
    } catch (err) {
        log("MAIN", "ERROR", `Failed writing new settings data to file. Error message:\n\t"${err}"`);
    }
}