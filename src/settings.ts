import { readFile, createFile } from "./fileHandling";
import { log } from "./logger";

let currentSettings: any | undefined = {};
const FILE_NAME: string = "settings.json";
const DEFAULT_SETTINGS: SettingsFile = {
    headless: false,
    launchOnStartup: false,
    checkingRate: 30,
    players: [],
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
        // TODO: send event for error?
        log("FATAL", `Failed creating settings file. Exiting drop-farmer. Error message:\n\t"${err}"`);
    }
}

/**
 * Read the settings file from the set filepath.
 * Also checks if the settings file exists,
 * if not it creates a new default one.
 */
function readSettingsFile(): SettingsFile | undefined {
    try {
        let fileData = readFile(FILE_NAME);
        return JSON.parse(fileData);
    } catch (err) {
        // TODO: send event for error?
        log("ERROR", `Failed reading settings file. Using default settings. App functions may not work properly. Error message:\n\t"${err}"`);
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