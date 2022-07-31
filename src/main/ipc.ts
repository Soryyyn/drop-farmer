import { ipcMain } from "electron-better-ipc";
import { shell } from "electron";
import { Channels } from "./common/channels";

/**
 * Reacts when a social link or something different is pressed, where it should
 * open a link in a external browser window.
 */
ipcMain.answerRenderer(Channels.openLinkInExternal, (link: string) => {
    shell.openExternal(link);
});