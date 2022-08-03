const { contextBridge, ipcRenderer } = require("electron");
// import { ipcRenderer } from "electron-better-ipc";
import useIpcListener from "electron-use-ipc-listener";
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
     * Call the main process to execute functions on main process without
     * waiting for a response.
     *
     * @param {Channels} channel The channel to call on main.
     * @param  {...any} args Arguments / data to send to main.
     */
    sendOneWay: (channel, ...args) => ipcRenderer.send(channel, ...args),
    /**
     * Call the main process to execute functions on main process and
     * wait for a response.
     *
     * @param {Channels} channel The channel to call on main.
     * @param  {...any} args Arguments / data to send to main.
     */
    sendAndWait: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    /**
     * React to a call from main process without giving a response.
     *
     * @param {Channels} channel The channel to answer from main.
     * @param {any} callback Function/'s to execute when replying to main.
     */
    handleOneWay: (channel, listener) => ipcRenderer.on(channel, listener),
    /**
     * Remove all the listeners of a specific event listener.
     * NOTE: Use this method in a component to prevent multiple fires.
     *
     * @param {Channels} channel The channel to remove all the listeners of.
     */
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});