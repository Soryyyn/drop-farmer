/**
 * Declare the types for the renderer process to understand the preload file.
 */

export interface API {
    channels: Object
    callMain: (channel: string, ...args: any[]) => Promise<unknown>,
    answerMain: (channel: string, callback: (data: any) => any) => void
}

declare global {
    interface Window {
        api: API;
    }
}