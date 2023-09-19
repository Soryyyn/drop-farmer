import { IpcMainInvokeEvent, ipcMain } from 'electron';
import { LogLevel, log } from '../util/logging';
import { getWindow } from './window';

export enum IPCChannel {}

/**
 * When the renderer process sends an IPC signal to the main process, the func
 * will get called.
 * The return value of `func` will be the reply sent to the renderer process.
 */
export function handleFromRenderer(
    channel: IPCChannel,
    func: (event: IpcMainInvokeEvent, ...args: any[]) => any
) {
    log(LogLevel.Debug, `Handling received signal from renderer on ${channel}`);
    ipcMain.handle(channel.toString(), func);
}

/**
 * Send an IPC signal to the renderer.
 * NOTE: When the main window is undefined (due to some circumstance) the signal
 * will not be sent.
 */
export function sendToRenderer(channel: IPCChannel, ...args: any[]) {
    const mainWindow = getWindow();

    if (!mainWindow) {
        log(
            LogLevel.Warn,
            `Signal on ${channel} was not sent because main window is not defined`
        );
        return;
    }

    log(LogLevel.Debug, `Sending signal to renderer on ${channel}`);
    mainWindow.webContents.send(channel.toString(), ...args);
}
