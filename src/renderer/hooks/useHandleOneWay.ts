import { useEffect } from "react";

/**
 * Hook to handle one-way signals from the main process.
 *
 * @param {string} channel The ipc channel to handle the signal for.
 * @param {any} dependency The use-effect dependency.
 * @param {(event: any, data: any) => void} callback The callback to execute after the signal has been received.
 */
export const useHandleOneWay = (channel: string, dependency: any, callback: (event: any, data: any) => void) => {
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.farmStatusChange, (event, data) => {
            callback(event, data);
        });

        return () => {
            window.api.removeAllListeners(channel);
        }
    }, [dependency]);
}