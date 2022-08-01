import { shell } from "electron";
import { ipcMain } from "electron-better-ipc";
import { Channels } from "./common/channels";
import { getFarms } from "./farms";

/**
 * Reacts when a social link or something different is pressed, where it should
 * open a link in a external browser window.
 */
ipcMain.answerRenderer(Channels.openLinkInExternal, (link: string) => {
    shell.openExternal(link);
});

/**
 * Reacts when the home site is loaded and the farms which are enabled need to
 * be displayed.
 */
ipcMain.answerRenderer(Channels.getFarms, () => {
    return getFarms();
});