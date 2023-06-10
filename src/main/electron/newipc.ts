import { IpcChannel } from '@main/util/constants';
import '@main/util/ipc-handlers';
import { ipcMain } from 'electron';
import { getMainWindow } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
 */
export function handleOneWay(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 */
export function handleAndReply(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) {
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 */
export function sendOneWay(channel: IpcChannel, ...args: any[]) {
    const window = getMainWindow();
    if (window !== undefined) {
        window.webContents.send(channel, ...args);
    }
}
