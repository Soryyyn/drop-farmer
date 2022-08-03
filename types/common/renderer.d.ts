/**
 * Declare the types for the renderer process to understand the preload file.
 */

export interface API {
    channels: any
    sendOneWay: (channel: string, ...args: any[]) => void,
    sendAndWait: (channel: string, ...args: any[]) => Promise<unknown>,
    handleOneWay: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void,
    removeAllListeners: (channel: string) => void
}

declare global {
    interface Window {
        api: API;
    }
}