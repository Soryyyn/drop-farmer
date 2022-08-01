const { contextBridge } = require("electron");
const { ipcRenderer } = require("electron-better-ipc");
import { Channels } from "./common/channels";

/**
 * Expose functionality from main to renderer process.
 *
 * Use the the context bridge via "window.api" and then the exposed methods / objects.
 * Ex. window.api.callMain()
 */
contextBridge.exposeInMainWorld("api", {
    /**
     * The channels for ipc communication.
     */
    channels: {
        ...Channels
    },
    /**
     * Call the main process to execute functions on main process and send back.
     *
     * @param {Channels} channel The channel to call on main.
     * @param  {...any} args Arguments / data to send to main.
     * @returns void
     */
    callMain: (channel, ...args) => ipcRenderer.callMain(channel, ...args),
    /**
     * Reply to the call from main process.
     *
     * @param {Channels} channel The channel to answer from main.
     * @param {any} callback Function/'s to execute when replying to main.
     * @returns void
     */
    answerMain: (channel, callback) => ipcRenderer.answerMain(channel, callback => any)
});