import AutoLaunch from 'auto-launch';
import { app } from 'electron';
import get from 'lodash.get';
import set from 'lodash.set';
import { convertFarmsIntoCached } from './farms/management';
import { createFile, readFile, writeToFile } from './files/handling';
import { enableDebugLogs, log } from './util/logger';
import { convertSettingsIntoCached } from './util/settings';

const FILE_NAME = 'config.json';
let currentConfig: any;
const autoLauncher = new AutoLaunch({
    name: 'drop-farmer'
});
const configVersion = 1.4;

export function initConfig(): void {
    createDefaultConfig();
    currentConfig = checkConfigUpdate(readConfig());

    /**
     * Update some settings which are needed on startup.
     */
    if (getConfigKey('settings.application.debugLogs')) enableDebugLogs(true);
    if (getConfigKey('settings.application.launchOnStartup'))
        launchOnStartup(true);

    log('MAIN', 'DEBUG', 'Initialized config');
}

/**
 * Creates the basic `config.json` file with the default settings applied and
 * the default farms.
 */
function createDefaultConfig(): void {
    /**
     * Default config file with the basic settings applied.
     * NOTE: The farms are empty here, because they are not yet initialized.
     */
    const defaultConfig: ConfigFile = {
        version: configVersion.toFixed(1).toString(),
        farms: convertFarmsIntoCached(),
        settings: convertSettingsIntoCached()
    };

    try {
        /**
         * Just create the file, it won't try to get overriden if it already exists.
         */
        createFile(FILE_NAME, JSON.stringify(defaultConfig, null, 4));
    } catch (err) {
        log('MAIN', 'FATAL', `Failed creating config file. ${err}`);
    }
}

/**
 * Reads the config file and return it.
 */
function readConfig() {
    try {
        return JSON.parse(readFile(FILE_NAME));
    } catch (err) {
        log('MAIN', 'FATAL', `Failed reading config file. ${err}`);
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
    log('MAIN', 'DEBUG', `Updated ${key} in runtime config`);
}

/**
 * Update the actual config file with the runtime config.
 */
export function updateConfigFile(): void {
    try {
        cacheAllData();
        writeToFile(FILE_NAME, JSON.stringify(currentConfig, null, 4), 'w');
        log('MAIN', 'DEBUG', 'Updated config file with runtime config');
    } catch (err) {
        log('MAIN', 'ERROR', `Failed to write runtime config to file. ${err}`);
    }
}

/**
 * Enable or disable the app launch on system startup.
 *
 * @param {boolean} launchOnStartup The launchOnStartup setting to set.
 */
export function launchOnStartup(launchOnStartup: boolean): void {
    autoLauncher
        .isEnabled()
        .then((isEnabled: boolean) => {
            if (launchOnStartup) {
                if (!isEnabled) {
                    autoLauncher.enable();
                    log('MAIN', 'INFO', 'Enabled launch on startup');
                }
            } else {
                if (isEnabled) {
                    autoLauncher.disable();
                    log('MAIN', 'INFO', 'Disabled launch on startup');
                }
            }
        })
        .catch((err) => {
            log(
                'MAIN',
                'ERROR',
                `Failed to change the launch on startup setting. ${err}`
            );
        });
}

function cacheAllData(): void {
    /**
     * Update farms.
     */
    updateKeyValue('farms', convertFarmsIntoCached());

    /**
     * Update settings.
     */
    updateKeyValue('settings', convertSettingsIntoCached());
}

/**
 * Migrate to a newer type of config file version.
 * @param {ConfigFile} configFile The found config file to migrate.
 */
function migrateToNewerConfigVersion(configFile: ConfigFile): ConfigFile {
    /**
     * Default to change.
     */
    const migrated: ConfigFile = {
        version: configVersion.toFixed(1).toString(),
        farms: convertFarmsIntoCached(),
        settings: convertSettingsIntoCached()
    };

    if (parseFloat(configFile.version) == 1.0) {
        migrated.farms = configFile.farms;
        migrated.settings = configFile.settings;
    }

    return migrated;
}

/**
 * Check if the config file is older than the current one.
 */
function checkConfigUpdate(configFile: ConfigFile): ConfigFile {
    let updated: any = configFile;

    if (!configFile.hasOwnProperty('version')) {
        /**
         * If no version key is found inside the config file, reset the file,
         * and set the default config.
         *
         * NOTE: While resetting, viewing the actual file will appear empty.
         */
        log(
            'MAIN',
            'INFO',
            'Version key inside config file not found. Resetting config file.'
        );
        writeToFile(FILE_NAME, '', 'w');
        updated = {
            version: configVersion.toFixed(1).toString(),
            farms: convertFarmsIntoCached(),
            settings: convertSettingsIntoCached()
        };
        writeToFile(FILE_NAME, JSON.stringify(updated, null, 4), 'w');
    } else if (parseFloat(configFile.version) < configVersion) {
        updated = migrateToNewerConfigVersion(configFile);
        log('MAIN', 'INFO', 'Migrated to a newer config file version');
    }

    return updated;
}
