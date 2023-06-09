import {
    SettingId,
    SettingOwnerType,
    SettingStoreSchema,
    SettingType,
    SettingUnion,
    SettingsObject,
    ToggleSetting,
    ValueOfSetting
} from '@df-types/settings.types';
import { DefinedSettings, FileNames } from '@main/util/constants';
import { getAppPath } from '@main/util/files';
import { log } from '@main/util/logging';
import { getObjectName } from '@main/util/objects';
import { generateUUID } from '@main/util/strings';
import AutoLaunch from 'auto-launch';
import ElectronStore from 'electron-store';

const autoLauncher = new AutoLaunch({ name: 'Drop Farmer' });

/**
 * The default settings to apply when the file doesn't exist yet.
 */
const defaultSettings: SettingsObject = {
    [generateUUID()]: {
        type: SettingOwnerType.Application,
        name: 'Application',
        settings: [
            applyDefaultToValue(getDefinedSetting(SettingId.LaunchOnStartup)!),
            applyDefaultToValue(
                getDefinedSetting(SettingId.ShowMainWindowOnLaunch)!
            ),
            applyDefaultToValue(getDefinedSetting(SettingId.ReducedMotion)!),
            applyDefaultToValue(getDefinedSetting(SettingId.LowResolution)!)
        ]
    }
};

/**
 * The settings/config store of the app.
 * After this store is created, the farm settings still need to be added.
 */
const store = new ElectronStore<SettingStoreSchema>({
    name: FileNames.SettingsStoreFileName,
    clearInvalidConfig: true,
    encryptionKey:
        process.env.NODE_ENV === 'production'
            ? process.env.STORES_ENCRYPTION_KEY
            : '',
    cwd: getAppPath(),
    defaults: {
        settings: defaultSettings
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
        },
        'v1.0.0-beta39': (store) => {
            store.clear();
        },
        'v1.0.0-beta47': (store) => {
            store.clear();
        },
        'v1.0.0-beta49': (store) => {
            store.clear();
        },
        'v1.0.0-beta50': (store) => {
            store.clear();
        }
    }
});

/**
 * Get all settings in the settings store.
 */
export function getSettings(): SettingsObject {
    return store.get('settings');
}

/**
 * Get all the settings of a specific owner by UUID.
 */
export function getSettingsOfOwnerByUUID(uuid: string) {
    return getSettings()[uuid];
}

/**
 * Get the settings by name.
 */
export function getSettingsOfOwnerByName(name: string) {
    return Object.values(getSettings()).find((entry) => entry.name === name);
}

/**
 * Update the settings.
 */
export function updateSettings(toUpdate: SettingsObject): void {
    store.set('settings', toUpdate);
    toggleAutoLaunch();
}

/**
 * Create a settings owner in the store.
 */
export function createSettingsOwner(
    name: string,
    type: SettingOwnerType
): void {
    if (getSettingsOfOwnerByName(name) === undefined) {
        const settings = getSettings();

        /**
         * Add the owner to the settings object.
         */
        settings[generateUUID()] = {
            type,
            name,
            settings: []
        };

        updateSettings(settings);

        log('info', `Created settings owner ${name}`);
    }
}

/**
 * Get a defined setting by it's id.
 */
export function getDefinedSetting<T extends SettingUnion>(id: SettingId) {
    return DefinedSettings.find((setting) => setting.id === id) as T;
}

/**
 * Apply the default as the value.
 */
export function applyDefaultToValue<T extends SettingUnion>(setting: T) {
    if (setting.type === SettingType.Date) {
        log(
            'warn',
            "Can't apply default value, because no default value exists on date setting"
        );
        return setting;
    }

    return { ...setting, value: setting.default };
}

/**
 * Validate if the value to set is valid for the wanted setting.
 */
function validateSetting(setting: SettingUnion): boolean {
    /**
     * Get the predefined setting to check if its valid.
     */
    const defined = getDefinedSetting(setting.id);

    if (!defined) {
        return false;
    }

    /**
     * If changing is disabled.
     */
    if (setting.type !== SettingType.Basic && setting.special?.disabled) {
        return false;
    }

    /**
     * Validate based on the setting type.
     */
    switch (setting.type) {
        case SettingType.Basic:
            return true;
        case SettingType.Text:
            return typeof setting.value === 'string';
        case SettingType.Toggle:
            return typeof setting.value === 'boolean';
        case SettingType.Date:
            return !isNaN(Date.parse(setting.value!));
        case SettingType.Number:
            if (typeof setting.value === 'number') {
                if (setting.min) {
                    return setting.value! >= setting.min;
                } else if (setting.max) {
                    return setting.value! <= setting.max;
                }

                return true;
            }

            return false;
        case SettingType.Selection:
            return setting.options.some(
                (option) => option.value === setting.value
            );
    }
}

/**
 * Get a specific setting of a owner from the current store.
 */
export function getSetting<T extends SettingUnion>(
    name: string,
    id: SettingId
) {
    return getSettingsOfOwnerByName(name)?.settings.find(
        (setting) => setting.id === id
    ) as T | undefined;
}

/**
 * Get the index of a setting in an owner.
 */
function getSettingIndex(uuid: string, id: SettingId) {
    return getSettingsOfOwnerByUUID(uuid).settings.findIndex(
        (setting) => setting.id === id
    );
}

/**
 * Get a specific settings saved value.
 */
export function getSettingValue<T extends SettingUnion>(
    name: string,
    id: SettingId
) {
    return getSetting<T>(name, id)?.value as T['value'];
}

/**
 * Update the settings of a specific owner by uuid.
 */
export function updateOwnerSettingsByUUID(
    uuid: string,
    ownerSettings: SettingUnion[]
) {
    const settings = getSettings();
    settings[uuid].settings = ownerSettings;
    updateSettings(settings);
}

/**
 * Update the settings of a specific owner by name.
 */
export function updateOwnerSettingsByName(
    name: string,
    ownerSettings: SettingUnion[]
) {
    const settings = getSettings();
    const ownerSettingsByName = getSettingsOfOwnerByName(name);

    if (ownerSettingsByName) {
        settings[getObjectName(ownerSettingsByName)].settings = ownerSettings;
        updateSettings(settings);
    }
}

/**
 * Update a specific setting in the given owner.
 */
export function updateSettingOfOwner(name: string, setting: SettingUnion) {
    const ownerSettings = getSettingsOfOwnerByName(name);

    if (!ownerSettings) {
        log(
            'warn',
            `Can't update setting of owner ${name} because owner doesn't exist`
        );
        return;
    }

    const indexToUpdate = ownerSettings.settings.findIndex(
        (ownerSetting) => ownerSetting.id === setting.id
    );
    ownerSettings.settings[indexToUpdate] = setting;
    updateOwnerSettingsByName(name, ownerSettings.settings);
}

/**
 * Add a specific setting to the wanted owner.
 */
export function addSettingToOwner<T extends SettingUnion>(
    name: string,
    id: SettingId,
    override?: Partial<T>
) {
    const ownerSettings = getSettingsOfOwnerByName(name);

    if (ownerSettings && !getSetting(name, id)) {
        let settingToAdd = applyDefaultToValue(getDefinedSetting<T>(id));

        /**
         * Override the setting if wanted.
         */
        settingToAdd = {
            ...settingToAdd,
            ...override
        };

        ownerSettings.settings.push(settingToAdd);
        updateOwnerSettingsByName(name, ownerSettings.settings);
    }
}

/**
 * Get the value of a setting or set the setting of the owner and get the value
 * of the newly created one.
 */
export function getOrSetSetting<T extends SettingUnion>(
    name: string,
    id: SettingId,
    override?: Partial<T>
): ValueOfSetting<T> {
    const ownerSettings = getSettingsOfOwnerByName(name);

    if (ownerSettings === undefined) {
        log(
            'warn',
            `Can't get or set setting for not yet created owner ${name}`
        );
        return;
    }

    const foundSetting = getSetting<T>(name, id);

    /**
     * Check if the owner has the wanted setting, if not, set it or return the value.
     */
    if (foundSetting) {
        return foundSetting.value;
    }

    let settingToAdd = applyDefaultToValue(getDefinedSetting<T>(id)!);

    /**
     * Override the default setting if defined.
     */
    if (override) {
        settingToAdd = {
            ...settingToAdd,
            ...override
        };
    }

    ownerSettings.settings.push(settingToAdd!);
    updateOwnerSettingsByName(name, ownerSettings.settings);
    return settingToAdd?.value;
}

/**
 * Update the setting.
 */
export function updateSetting(
    name: string,
    id: SettingId,
    value: ValueOfSetting<SettingUnion>
) {
    const foundSetting = getSetting(name, id);

    /**
     * Only update the setting if the setting already exists.
     */
    if (foundSetting) {
        foundSetting.value = value;

        /**
         * Only update the setting if validation passes.
         */
        validateSetting(foundSetting) &&
            updateSettingOfOwner(name, foundSetting);
    }
}

/**
 * Delete a setting of the owner by name.
 */
export function deleteSetting(name: string, id: SettingId): void {
    const ownerSettings = getSettingsOfOwnerByName(name);

    if (ownerSettings) {
        const index = getSettingIndex(name, id);

        if (index && index !== -1) {
            ownerSettings.settings.splice(index, 1);
            updateOwnerSettingsByName(name, ownerSettings.settings);
        }
    }
}

/**
 * Delete an owner of settings by uuid.
 */
export function deleteOwnerByUUID(uuid: string) {
    const settings = getSettings();
    delete settings[uuid];
    updateSettings(settings);
}

/**
 * Delete an owner of settings by name.
 */
export function deleteOwnerByName(name: string) {
    const settings = getSettings();
    const ownerSettings = getSettingsOfOwnerByName(name);

    if (ownerSettings) {
        delete settings[getObjectName(ownerSettings)];
        updateSettings(settings);
    }
}

/**
 * Toggle the autolaunch of the app.
 */
function toggleAutoLaunch(): void {
    autoLauncher.isEnabled().then((isEnabled) => {
        const enabled = getSettingValue<ToggleSetting>(
            'application',
            SettingId.LaunchOnStartup
        );

        if (!isEnabled && enabled) {
            autoLauncher.enable();
        } else if (isEnabled && !enabled) {
            autoLauncher.disable();
        }
    });
}

/**
 * Get all owners which have a specific type.
 */
export function getOwnersByType(type: SettingOwnerType) {
    return Object.values(getSettings()).filter((owner) => owner.type === type);
}
