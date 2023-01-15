import { FileNames } from '@main/common/constants';
import AutoLaunch from 'auto-launch';
import { app } from 'electron';
import ElectronStore from 'electron-store';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { log } from './logging';

const autoLauncher = new AutoLaunch({ name: 'drop-farmer' });

/**
 * The settings/config store of the app.
 * After this store is created, the farm settings still need to be added.
 */
const store = new ElectronStore<SettingsStoreSchema>({
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
            application: [
                {
                    id: 'launchOnStartup',
                    shown: 'Launch on startup',
                    desc: 'Enable or disable if drop-farmer should be started when your PC has finished booting.',
                    value: false,
                    default: false
                },
                {
                    id: 'showMainWindowOnLaunch',
                    shown: 'Show main window on launch',
                    desc: 'If the main window should be shown when drop-farmer starts.',
                    value: true,
                    default: true
                },
                {
                    id: 'showWindowsForLogin',
                    shown: 'Show farm windows automatically for login',
                    desc: 'If enabled, the window of a farm, where login is required to continue, will automatically be shown.',
                    value: false,
                    default: false
                },
                {
                    id: 'checkForUpdates',
                    shown: 'Automatically check for updates',
                    desc: "Enable to automatically check for updates. If you don't wan't to update, disable this setting.",
                    value: true,
                    default: true,
                    requiresRestart: true
                },
                {
                    id: 'reducedMotion',
                    shown: 'Prefer reduced motion',
                    desc: 'Enable this setting to keep animations & transitions to the minimum.',
                    value: false,
                    default: false,
                    requiresRestart: true
                }
            ]
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
        }
    }
});

/**
 * Get all settings in the settings store.
 */
export function getSettings(): SettingsOnly {
    return store.get('settings');
}

/**
 * Get a specific setting of the settings store by dot notation.
 */
export function getSetting(owner: string, id: string): Setting | undefined {
    const settings: Setting[] = store.get(`settings.${owner}`);
    return settings.find((setting) => setting?.id === id);
}

/**
 * Set a specific setting by key and value pair via dot notation.
 */
export function setSetting(owner: string, value: Setting) {
    if (!store.get(`settings.${owner}`)) {
        store.set(`settings.${owner}`, []);
    }

    const settings: Setting[] = store.get(`settings.${owner}`);
    settings.push(value);
    store.set(`settings.${owner}`, settings);
}

/**
 * Checks if a specific setting exists inside an owner object
 */
export function doesSettingExist(owner: string, id: string): boolean {
    const settings: Setting[] = store.get(`settings.${owner}`);

    if (settings !== undefined && Array.isArray(settings)) {
        if (settings.find((setting) => setting?.id === id)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

/**
 * Update the setting if it exists.
 */
export function updateSetting(
    owner: string,
    id: string,
    updated: Setting
): void {
    if (doesSettingExist(owner, id)) {
        /**
         * Remove the old setting and save it's index.
         */
        const settings: Setting[] = store.get(`settings.${owner}`);
        const index = settings.findIndex((setting) => setting.id === id);
        settings.splice(index, 1);

        /**
         * Insert updated settings at old position.
         */
        settings.splice(index, 0, updated);
        store.set(`settings.${owner}`, settings);

        toggleAutoLaunch();
    }
}

/**
 * Update the whole settings at once.
 */
export function updateSettings(settings: SettingsOnly): void {
    store.set('settings', settings);

    toggleAutoLaunch();
}

/**
 * Delete the settings entry and it's settings of a specific owner.
 */
export function deleteSettingsOfOwner(owner: string): void {
    const settings = getSettings();

    for (const [key, value] of Object.entries(settings)) {
        if (key === owner) {
            delete settings[key];
        }
    }

    updateSettings(settings);
}

function toggleAutoLaunch(): void {
    autoLauncher.isEnabled().then((isEnabled) => {
        const setting = getSetting('application', 'launchOnStartup')!
            .value as boolean;

        if (!isEnabled && setting) autoLauncher.enable();
        if (isEnabled && !setting) autoLauncher.disable();
    });
}
