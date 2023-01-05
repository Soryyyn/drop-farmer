import { app, ipcMain, shell } from 'electron';
import { IpcChannels } from '../common/constants';
import {
    applySettingsToFarms,
    getFarmById,
    getFarmsRendererData
} from '../farms/management';
import { getSettings, updateSettings } from '../store';
import { log } from '../util/logger';
import { sendBasicToast, sendPromiseToast } from '../util/toast';
import { setAppQuitting } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param {IpcChannels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback when event has been received.
 */
export function handleOneWay(
    channel: IpcChannels,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    log('MAIN', 'DEBUG', `Handling one-way signal on ${channel}`);
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 *
 * @param {IpcChannels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback to execute when event has been received.
 */
export function handleAndReply(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) {
    log('MAIN', 'DEBUG', `Handling two-way signal on ${channel}`);
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to send the ipc signal too.
 * @param {IpcChannels} channel The ipc channel to send the signal too.
 * @param {...any[]} args The data to send with the signal.
 */
export function sendOneWay(
    window: Electron.BrowserWindow,
    channel: string,
    ...args: any[]
) {
    if (window.webContents != undefined) {
        log('MAIN', 'DEBUG', `Sending one-way signal on ${channel}`);
        window.webContents.send(channel, ...args);
    }
}

/**
 * Ipc events below.
 */
handleOneWay(IpcChannels.log, (event, { type, message }) => {
    log('RENDERER', type, message);
});

handleAndReply(IpcChannels.getFarms, () => {
    return getFarmsRendererData();
});

handleOneWay(
    IpcChannels.farmWindowsVisibility,
    (event, updated: FarmRendererData) => {
        const farm = getFarmById(updated.id);
        farm?.toggleWindowsVisibility();
    }
);

handleOneWay(IpcChannels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

handleOneWay(IpcChannels.shutdown, () => {
    setAppQuitting(true);
    app.quit();
});

handleAndReply(IpcChannels.getSettings, () => {
    return getSettings();
});

handleOneWay(
    IpcChannels.saveNewSettings,
    (event, settingsToSave: SettingsSchema) => {
        sendPromiseToast(
            {
                id: 'settings-saving',
                textOnLoading: 'Saving settings...',
                textOnSuccess: 'Saved settings.',
                textOnError: 'Failed saving settings.',
                duration: 4000
            },
            new Promise(async (resolve, reject) => {
                try {
                    updateSettings(settingsToSave);
                    applySettingsToFarms();
                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            })
        );
    }
);

handleAndReply(IpcChannels.getApplicationVersion, () => {
    return app.getVersion();
});

handleOneWay(IpcChannels.clearCache, (event, id) => {
    const farm = getFarmById(id);
    if (farm != undefined) {
        sendBasicToast(
            {
                id: `cleared-cache-${farm.id}`,
                textOnSuccess: `Cleared cache for ${farm.shown}.`,
                textOnError: `Failed clearing cache for ${farm.shown}}.`,
                duration: 4000
            },
            () => {
                farm.restartScheduler(async () => {
                    await farm.clearCache();
                });
            }
        );
    }
});

handleOneWay(IpcChannels.restartScheduler, (event, name) => {
    const farm = getFarmById(name);
    if (farm != undefined) {
        sendBasicToast(
            {
                id: `restart-schedule-${farm.id}`,
                textOnSuccess: `Restarted schedule for ${farm.shown}.`,
                textOnError: `Failed restarting schedule for ${farm.shown}}.`,
                duration: 4000
            },
            () => {
                farm.restartScheduler();
            }
        );
    }
});
