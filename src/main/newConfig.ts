import get from "lodash.get";
import set from "lodash.set";
import { createFile, readFile, writeToFile } from "./files/handling";
import { log } from "./util/logger";
import { convertSettingsIntoCached } from "./util/settings";

const FILE_NAME = "config2.json";
let currentConfig: any = {};

export function initConfig2(): void {
    createDefaultConfig();
    currentConfig = readConfig();
    log("MAIN", "DEBUG", "Initialized config");
};

/**
 * Creates the basic `config.json` file with the default settings applied and
 * the default farms.
 */
export function createDefaultConfig(): void {
    /**
     * Default config file with the basic settings applied.
     */
    let defaultConfig = {
        farms: [],
        settings: convertSettingsIntoCached(),
    };

    try {
        /**
         * Just create the file, it won't try to get overriden if it already exists.
         */
        createFile(FILE_NAME, JSON.stringify(defaultConfig, null, 4));
    } catch (err) {
        log("MAIN", "FATAL", `Failed creating config file. ${err}`);
    }
}

/**
 * Reads the config file and return it.
 */
export function readConfig() {
    try {
        return JSON.parse(readFile(FILE_NAME));
    } catch (err) {
        log("MAIN", "FATAL", `Failed reading config file. ${err}`);
    }
}

/**
 * Returns the value of the specified key from the config.
 *
 * @param {string} key The key of the config to return.
 */
export function getConfigKey(key: string): any {
    return get(currentConfig, key);
}

/**
 * Update / override a value of the config file.
 *
 * @param {string} key The key of the config to update the value of.
 * @param {any} value The value of the key to update / set.
 */
export function updateKeyValue(key: string, value: any): void {
    set(currentConfig, key, value);
    log("MAIN", "DEBUG", `Updated ${key} in runtime config`);
}

/**
 * Update the actual config file with the runtime config.
 */
export function updateConfigFile(): void {
    try {
        writeToFile(FILE_NAME, JSON.stringify(currentConfig, null, 4), "w");
        log("MAIN", "DEBUG", "Updated config file with runtime config");
    } catch (err) {
        log("MAIN", "ERROR", `Failed to write runtime config to file. ${err}`);
    }
}