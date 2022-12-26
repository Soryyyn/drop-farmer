import { app } from 'electron';
import ElectronStore from 'electron-store';
import { join } from 'path';
import { log } from './util/logger';

type Setting = {
    id: string;
    shown: string;
    desc: string;
    value: string | number | boolean;
    default: string | number | boolean;
    min?: number;
    max?: number;
    disabled?: boolean;
};

type SettingsStoreSchema = {
    settings: {
        application: Setting[];
        [name: string]: Setting[];
    };
};

const store = new ElectronStore<SettingsStoreSchema>({
    name: 'store',
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
                    default: true
                },
                {
                    id: 'reducedMotion',
                    shown: 'Prefer reduced motion',
                    desc: 'Enable this setting to keep animations & transitions to the minimum.',
                    value: false,
                    default: false
                },
                {
                    id: 'debugLogs',
                    shown: 'Enable debug logs',
                    desc: 'Enable the debug logs. Use for debugging or reporting errors.',
                    value: false,
                    default: false
                }
            ]
        }
    },
    cwd:
        process.env.NODE_ENV === 'production'
            ? app.getPath('userData')
            : join(__dirname, '../../')
});

export function getSettings() {
    return store.get('settings');
}

export function getSetting(setting: string) {
    return store.get(`settings.${setting}`);
}

export function setSetting(key: string, value: any) {
    store.set(`settings.${key}`, value);
}
