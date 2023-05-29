import {
    SettingId,
    SettingOwner,
    SettingOwnerType,
    SettingSchema,
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
import AutoLaunch from 'auto-launch';
import ElectronStore from 'electron-store';

const autoLauncher = new AutoLaunch({ name: 'Drop Farmer' });

/**
 * The default settings to apply when the file doesn't exist yet.
 */
const defaultSettings: SettingsObject = {
    application: {
        type: SettingOwnerType.Application,
        settings: [
            applyDefaultToValue(getDefinedSetting(SettingId.LaunchOnStartup)!),
            applyDefaultToValue(
                getDefinedSetting(SettingId.ShowMainWindowOnLaunch)!
            ),
            applyDefaultToValue(
                getDefinedSetting(SettingId.ShowWindowsForLogin)!
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
 * Get all the settings of a specific owner.
 */
export function getSettingsOfOwner(owner: SettingOwner): SettingSchema {
    return getSettings()[owner];
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
    owner: SettingOwner,
    type: SettingOwnerType
): void {
    if (getSettingsOfOwner(owner) === undefined) {
        const settings = getSettings();

        /**
         * Add the owner to the settings object.
         */
        settings[owner] = {
            type,
            settings: []
        };

        updateSettings(settings);

        log('info', `Created settings owner ${owner}`);
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
export function applyDefaultToValue(setting: SettingUnion) {
    if (setting.type === SettingType.Date) {
        log(
            'warn',
            "Can't apply default value, because no default value exists on date setting"
        );
        return setting;
    }

    return { ...setting, value: setting.default } as SettingUnion;
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
    owner: SettingOwner,
    id: SettingId
) {
    return getSettingsOfOwner(owner).settings.find(
        (setting) => setting.id === id
    ) as T | undefined;
}

/**
 * Get the index of a setting in an owner.
 */
export function getSettingIndex(owner: SettingOwner, id: SettingId) {
    return getSettingsOfOwner(owner).settings.findIndex(
        (setting) => setting.id === id
    );
}

/**
 * Get a specific settings saved value.
 */
export function getSettingValue<T extends SettingUnion>(
    owner: SettingOwner,
    id: SettingId
) {
    return getSetting<T>(owner, id)?.value as T['value'];
}

/**
 * Update the settings of a specific owner.
 */
export function updateOwnerSettings(
    owner: SettingOwner,
    ownerSettings: SettingUnion[]
) {
    const settings = getSettings();
    settings[owner].settings = ownerSettings;
    updateSettings(settings);
}

/**
 * Update a specific setting in the given owner.
 */
export function updateSettingOfOwner(
    owner: SettingOwner,
    setting: SettingUnion
) {
    const ownerSettings = getSettingsOfOwner(owner);

    if (!ownerSettings) {
        log(
            'warn',
            `Can't update setting of owner ${owner} because owner doesn't exist`
        );
        return;
    }

    const indexToUpdate = ownerSettings.settings.findIndex(
        (ownerSetting) => ownerSetting.id === setting.id
    );
    ownerSettings.settings[indexToUpdate] = setting;
    updateOwnerSettings(owner, ownerSettings.settings);
}

/**
 * Add a specific setting to the wanted owner.
 */
export function addSettingToOwner(owner: SettingOwner, setting: SettingUnion) {
    const ownerSettings = getSettingsOfOwner(owner);

    if (!ownerSettings) {
        log(
            'warn',
            `Failed adding setting to owner ${owner} because it doesn't exist`
        );
        return;
    }

    ownerSettings.settings.push(setting);
    updateOwnerSettings(owner, ownerSettings.settings);
}

/**
 * Get the value of a setting or set the setting of the owner and get the value
 * of the newly created one.
 */
export function getOrSetSetting(
    owner: SettingOwner,
    id: SettingId,
    override?: Partial<SettingUnion>
): ValueOfSetting<SettingUnion> {
    const ownerSettings = getSettingsOfOwner(owner);

    if (ownerSettings === undefined) {
        log(
            'warn',
            `Can't get or set setting for not yet created owner ${owner}`
        );
        return;
    }

    const foundSetting = getSetting(owner, id);

    /**
     * Check if the owner has the wanted setting, if not, set it or return the value.
     */
    if (foundSetting) {
        return foundSetting.value;
    }

    let settingToAdd = applyDefaultToValue(getDefinedSetting(id)!);

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
    updateOwnerSettings(owner, ownerSettings.settings);
    return settingToAdd?.value;
}

/**
 * Update the setting.
 */
export function updateSetting(
    owner: SettingOwner,
    id: SettingId,
    value: ValueOfSetting<SettingUnion>
) {
    if (owner === undefined) {
        log(
            'warn',
            `Can't update setting ${id} of owner ${owner} when owner doesn't exist`
        );
        return;
    }

    const foundSetting = getSetting(owner, id);

    /**
     * Only update the setting if the setting already exists.
     */
    if (foundSetting) {
        foundSetting.value = value;

        /**
         * Only update the setting if validation passes.
         */
        validateSetting(foundSetting) &&
            updateSettingOfOwner(owner, foundSetting);
    }
}

/**
 * Delete a setting of the owner by name.
 */
export function deleteSetting(owner: SettingOwner, id: SettingId): void {
    const ownerSettings = getSettingsOfOwner(owner);

    if (ownerSettings) {
        const index = getSettingIndex(owner, id);

        if (index && index !== -1) {
            ownerSettings.settings.splice(index, 1);
            updateOwnerSettings(owner, ownerSettings.settings);
        }
    }
}

/**
 * Delete an owner of settings.
 */
export function deleteOwner(owner: SettingOwner) {
    const settings = getSettings();
    delete settings[owner];
    updateSettings(settings);
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
