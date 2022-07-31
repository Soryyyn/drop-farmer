const { contextBridge } = require("electron");
const { ipcRenderer } = require("electron-better-ipc");
import { Channels } from "./common/channels";

/**
 * Expose functionality from main to renderer process.
 * Channels for IPC are in the channels object.
 */
contextBridge.exposeInMainWorld("api", {
    channels: {
        ...Channels
    },
    callMain: (channel, ...args) => ipcRenderer.callMain(channel, ...args),
    answerMain: (channel, callback) => ipcRenderer.answerMain(channel, callback => any)
});