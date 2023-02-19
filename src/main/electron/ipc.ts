import { IpcChannel, IpcChannels } from '@main/common/constants';
import { removeTypeFromText } from '@main/common/stringManipulation';
import {
    applySettingsToFarms,
    getFarmById,
    getFarmsRendererData
} from '@main/farming/management';
import { log } from '@main/util/logging';
import { sendToast } from '@main/util/toast';
import { app, ipcMain, shell } from 'electron';
import { getSettings, updateSettings } from '../util/settings';
import { getMainWindow, setAppQuitting } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param {IpcChannels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback when event has been received.
 */
export function handleOneWay(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    log('info', `Handling one-way signal on ${channel}`);
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
    log('info', `Handling two-way signal on ${channel}`);
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to send the ipc signal too.
 * @param {IpcChannels} channel The ipc channel to send the signal too.
 * @param {...any[]} args The data to send with the signal.
 */
export function sendOneWay(channel: string, ...args: any[]) {
    const window = getMainWindow();
    if (window !== undefined && window.webContents !== undefined) {
        log('info', `Sending one-way signal on ${channel}`);
        window.webContents.send(channel, ...args);
    }
}

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

handleAndReply(IpcChannels.getApplicationVersion, () => {
    return app.getVersion();
});

handleOneWay(IpcChannels.clearCache, (event, id) => {
    const farm = getFarmById(id);
    if (farm != undefined) {
        sendToast(
            {
                type: 'basic',
                id: `cleared-cache-${farm.id}`,
                textOnSuccess: `Cleared cache for ${removeTypeFromText(
                    farm.id
                )}.`,
                textOnError: `Failed clearing cache for ${removeTypeFromText(
                    farm.id
                )}}.`,
                duration: 4000
            },
            async () => {
                await farm.restartScheduler(undefined, async () => {
                    await farm.clearCache();
                });
            }
        );
    }
});

handleOneWay(IpcChannels.restartScheduler, (event, name) => {
    const farm = getFarmById(name);
    if (farm != undefined) {
        sendToast(
            {
                type: 'basic',
                id: `restart-schedule-${farm.id}`,
                textOnSuccess: `Restarted schedule for ${removeTypeFromText(
                    farm.id
                )}.`,
                textOnError: `Failed restarting schedule for ${removeTypeFromText(
                    farm.id
                )}}.`,
                duration: 4000
            },
            async () => {
                await farm.restartScheduler();
            }
        );
    }
});
