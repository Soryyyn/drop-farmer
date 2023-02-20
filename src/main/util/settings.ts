import {
    FileNames,
    IpcChannels,
    PossibleSettings
} from '@main/common/constants';
import { handleAndReply, handleOneWay, sendOneWay } from '@main/electron/ipc';
import { applySettingsToFarms } from '@main/farming/management';
import AutoLaunch from 'auto-launch';
import { app } from 'electron';
import ElectronStore from 'electron-store';
import { join } from 'path';
import { log } from './logging';
import { sendToast } from './toast';

const autoLauncher = new AutoLaunch({ name: 'drop-farmer' });

/**
 * The settings/config store of the app.
 * After this store is created, the farm settings still need to be added.
 */
const store = new ElectronStore<NewSettingsStoreSchema>({
    name: FileNames.SettingsStoreFileName,
    clearInvalidConfig: true,
    encryptionKey:
        process.env.NODE_ENV === 'production'
            ? process.env.STORES_ENCRYPTION_KEY
            : '',
    cwd:
        process.env.NODE_ENV === 'production'
            ? app.getPath('userData')
            : join(__dirname, '../../'),
    defaults: {
        settings: {
            application: {
                'application-launchOnStartup': false,
                'application-showMainWindowOnLaunch': true,
                'application-showWindowsForLogin': false,
                'application-checkForUpdates': true
            }
        }
    },
    beforeEachMigration: (store, context) => {
        log(
            'info',
            `Migrated settings from version ${context.fromVersion} to ${context.toVersion}`
        );
    },
    migrations: {
        '<v1.0.0-beta31': (store) => {
            store.clear();
        },
        'v1.0.0-beta32': (store) => {
            store.clear();
        },
        'v1.0.0-beta33': (store) => {
            store.clear();
        },
        'v1.0.0-beta37': (store) => {
            store.clear();
        },
        'v1.0.0-beta38': (store) => {
            store.clear();
        }
    }
});

/**
 * Get all settings in the settings store.
 */
export function getSettings(): SettingsOfOwners {
    return store.get('settings');
}

/**
 * Create a settings owner in the store.
 */
export function createSettingsOwner(owner: string): void {
    if (getSettingsOfOwner(owner) === undefined) {
        const settings = getSettings();
        settings[owner] = {};
        updateSettings(settings);

        log('info', `Created settings owner ${owner}`);
    }
}

/**
 * Validate if the value to set is valid for the wanted setting.
 */
function validateSetting(
    settingName: string,
    valueToValidate: SettingValue
): boolean {
    const config = getSettingConfig(settingName);

    if (config === undefined) {
        return false;
    }

    /**
     * If it is a selection setting.
     */
    if ((config as SelectionSetting).options) {
        if (
            (config as SelectionSetting).options.findIndex(
                (option) => option === valueToValidate
            ) !== -1
        ) {
            return true;
        } else {
            return false;
        }
    } else if (
        /**
         * If it is a boolean setting.
         */
        typeof config.default === 'boolean' &&
        typeof valueToValidate === 'boolean'
    ) {
        return true;
    } else if (
        /**
         * If it is a text setting.
         */
        typeof config.default === 'string' &&
        typeof valueToValidate === 'string'
    ) {
        return true;
    } else if (
        /**
         * If it is a number setting.
         */
        typeof config.default === 'number' &&
        typeof valueToValidate === 'number'
    ) {
        return true;
    } else {
        return false;
    }
}

/**
 * Get a specific settings saved value.
 */
export function getSettingValue(
    owner: string,
    settingName: string
): SettingValue | undefined {
    const settings: SettingsInFile = store.get(`settings.${owner}`);

    let foundSetting: SettingValue | undefined = undefined;
    for (const [key, value] of Object.entries(settings)) {
        if (key === settingName) {
            foundSetting = value;
        }
    }

    return foundSetting;
}

/**
 * Get a settings value or set it, if it hasn't been set yet.
 */
export function getSettingOrSet(
    owner: string,
    settingName: string,
    toSet?: SettingValue
): SettingValue | undefined {
    const settings = getSettings();
    const settingsOfOwner = getSettingsOfOwner(owner)!;

    if (getSettingValue(owner, settingName) === undefined) {
        const settingConfig = getSettingConfig(settingName);

        if (settingConfig === undefined) {
            log('error', "Can't set a setting which isn't a possible setting.");
        } else {
            if (!toSet) {
                settingsOfOwner![settingName] = settingConfig.default;
                settings[owner] = settingsOfOwner!;
                updateSettings(settings);
                return;
            }

            if (validateSetting(settingName, toSet)) {
                settingsOfOwner![settingName] = toSet;
                settings[owner] = settingsOfOwner!;
                updateSettings(settings);

                return toSet;
            } else {
                log(
                    'error',
                    "Value to set of setting didn't succeed validation"
                );
            }
        }
    } else {
        return getSettingValue(owner, settingName)!;
    }
}

/**
 * Get the configuration of a setting based on it's name.
 */
export function getSettingConfig(settingName: string): Setting | undefined {
    return PossibleSettings.find(
        (possibleSetting) => possibleSetting.id === settingName
    );
}

/**
 * Get all the settings of a specific owner.
 */
export function getSettingsOfOwner(owner: string): SettingsInFile | undefined {
    return getSettings()[owner];
}

/**
 * Set a new value for the setting.
 * Also gets validated by the config of a setting to determine if the change is valid.
 */
export function setSettingValue(
    owner: string,
    settingName: string,
    newValue?: SettingValue
): void {
    const settings = getSettings();
    const settingsOfOwner = getSettingsOfOwner(owner);
    const settingConfig = getSettingConfig(settingName);

    if (settingConfig) {
        if (!newValue) {
            settingsOfOwner![settingName] = settingConfig.default;
            settings[owner] = settingsOfOwner!;
            updateSettings(settings);
            return;
        }

        if (validateSetting(settingName, newValue)) {
            settingsOfOwner![settingName] = newValue;
            settings[owner] = settingsOfOwner!;
            updateSettings(settings);
        } else {
            log('error', "New value of setting didn't succeed validation");
        }
    } else {
        log(
            'error',
            "Can't change the value of a setting which doesn't exist."
        );
    }
}

/**
 * Update the settings.
 */
export function updateSettings(toUpdate: SettingsOfOwners): void {
    store.set('settings', toUpdate);
    toggleAutoLaunch();
}

/**
 * Check if an owner has a specific setting set.
 */
function doesSettingExist(owner: string, settingName: string): boolean {
    const settingsOfOwner = getSettingsOfOwner(owner);

    let found = false;

    for (const setting of Object.keys(settingsOfOwner!)) {
        if (settingName === setting) {
            found = true;
        }
    }

    return found;
}

/**
 * Delete a setting of the owner by name.
 */
export function deleteSetting(owner: string, settingName: string): void {
    const settings = getSettings();
    const settingsOfOwner = getSettingsOfOwner(owner);

    if (doesSettingExist(owner, settingName)) {
        delete settingsOfOwner![settingName];
        settings[owner] = settingsOfOwner!;
        updateSettings(settings);
    } else {
        log('error', "Can't delete setting which owner doesn't have.");
    }
}

/**
 * Delete all the settings of an owner.
 */
export function deleteAllOwnerSettings(owner: string) {
    const settings = getSettings();

    delete settings[owner];
    updateSettings(settings);
}

/**
 * Toggle the autolaunch of the app.
 */
function toggleAutoLaunch(): void {
    autoLauncher.isEnabled().then((isEnabled) => {
        const setting = getSettingValue(
            'application',
            'application-launchOnStartup'
        );

        if (!isEnabled && setting) {
            autoLauncher.enable();
        } else if (isEnabled && !setting) {
            autoLauncher.disable();
        }
    });
}

/**
 * Get all setting values and their configs.
 */
export function getMergedSettings(): MergedSettings {
    const settings = getSettings();
    const merged: MergedSettings = {};

    /**
     * Go through each setting and merge configs with their value set.
     */
    for (const [owner, settingsOfOwner] of Object.entries(settings)) {
        merged[owner] = [];

        for (const [settingName, value] of Object.entries(settingsOfOwner)) {
            const config = getSettingConfig(settingName);
            const mergedSetting: SettingWithValue = {
                ...config!,
                value: value
            };

            merged[owner].push(mergedSetting);
        }
    }

    return merged;
}

/**
 * Extract the actual settings without the config from the merged settings.
 */
function extractMergedSettings(
    mergedSettings: MergedSettings
): SettingsOfOwners {
    const extracted: SettingsOfOwners = {};

    for (const [owner, settings] of Object.entries(mergedSettings)) {
        extracted[owner] = {};

        settings.forEach((setting) => {
            extracted[owner][setting.id] = setting.value;
        });
    }

    return extracted;
}

handleAndReply(IpcChannels.getSettings, () => {
    return getMergedSettings();
});

// handleOneWay(
//     IpcChannels.saveNewSettings,
//     (event, settingsToSave: SettingsOnly) => {
//         sendToast(
//             {
//                 type: 'promise',
//                 id: 'settings-saving',
//                 textOnLoading: 'Saving settings...',
//                 textOnSuccess: 'Saved settings.',
//                 textOnError: 'Failed saving settings.',
//                 duration: 4000
//             },
//             undefined,
//             new Promise(async (resolve, reject) => {
//                 try {
//                     updateSettings(settingsToSave);
//                     applySettingsToFarms();
//                     resolve(undefined);
//                 } catch (err) {
//                     reject(err);
//                 }
//             })
//         );

//         /**
//          * Notify renderer of settings changed.
//          */
//         sendOneWay(IpcChannels.settingsChanged, getSettings());
//     }
// );
