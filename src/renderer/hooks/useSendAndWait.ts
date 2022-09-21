import { useEffect } from "react";

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 * @param {(err: any, response: any) => void} callback The callback with the response or error.
 */
export const useSendAndWait = (channel: string, args: any, callback: (err: any, response: any) => void) => {
    useEffect(() => {
        window.api.sendAndWait(channel, args)
            .then((result) => {
                callback(undefined, result);
            })
            .catch((err) => {
                callback(new Error(`Error when sending and waiting hook. ${err}`), null);
            });

        return () => {
            window.api.removeAllListeners(channel);
        }
    }, []);
}