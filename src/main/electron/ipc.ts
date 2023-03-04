import { IpcChannel } from '@main/common/constants';
import { log } from '@main/util/logging';
import { ipcMain } from 'electron';
import { getMainWindow } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
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
 */
export function sendOneWay(channel: string, ...args: any[]) {
    const window = getMainWindow();
    if (window !== undefined && window.webContents !== undefined) {
        log('info', `Sending one-way signal on ${channel}`);
        window.webContents.send(channel, ...args);
    }
}
