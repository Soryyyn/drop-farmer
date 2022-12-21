import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Channels } from './main/common/channels';

export default {
    /**
     * The channels for ipc communication.
     */
    channels: Channels,
    /**
     * Call the main process to execute functions on main process without
     * waiting for a response.
     *
     * @param {Channels} channel The channel to call on main.
     * @param  {...any} args Arguments / data to send to main.
     */
    sendOneWay: (channel: Channels, ...args: any[]) =>
        ipcRenderer.send(channel, ...args),
    /**
     * Call the main process to execute functions on main process and
     * wait for a response.
     *
     * @param {Channels} channel The channel to call on main.
     * @param  {...any} args Arguments / data to send to main.
     */
    sendAndWait: (channel: Channels, ...args: any[]) =>
        ipcRenderer.invoke(channel, ...args),
    /**
     * React to a call from main process without giving a response.
     *
     * @param {Channels} channel The channel to answer from main.
     * @param {any} callback Function/'s to execute when replying to main.
     */
    handleOneWay: (
        channel: Channels,
        listener: (event: IpcRendererEvent, ...args: any[]) => void
    ) => ipcRenderer.on(channel, listener),
    /**
     * Remove all the listeners of a specific event listener.
     * NOTE: Use this method in a component to prevent multiple fires.
     *
     * @param {Channels} channel The channel to remove all the listeners of.
     */
    removeAllListeners: (channel: Channels) =>
        ipcRenderer.removeAllListeners(channel),
    /**
     * Log with the process "RENDERER" to the console and logfile.
     *
     * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
     */
    log: (
        type: 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG',
        message: string
    ) => ipcRenderer.send(Channels.log, { type: type, message: message })
};
