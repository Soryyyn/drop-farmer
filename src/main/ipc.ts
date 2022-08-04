import { ipcMain, shell } from "electron";
import { Channels } from "./common/channels";
import { getFarms, getFarmsStatus } from "./farms";

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param channel IPC channel to listen on.
 * @param listener Callback when event has been received.
 */
function handleOneWay(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void) {
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 *
 * @param channel IPC channel to listen on.
 * @param listener Callback to execute when event has been received.
 */
function handleAndReply(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
    ipcMain.handle(channel, listener);
}

export function sendOneWay(window: Electron.BrowserWindow, channel: string, ...args: any[]) {
    window.webContents.send(channel, ...args);
}

/**
 * Reacts when a social link or something different is pressed, where it should
 * open a link in a external browser window.
 */
handleOneWay(Channels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

/**
 * Reacts when the home site is loaded and the farms need to be displayed.
 * Also sends the status of all farms to handle.
 */
handleAndReply(Channels.getFarms, () => {
    return {
        farms: getFarms(),
        farmsStatus: getFarmsStatus()
    };
});