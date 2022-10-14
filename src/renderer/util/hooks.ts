import { useEffect, useState } from "react";

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 */
export function useSendAndWait(channel: string, args: any, callback: (err: any, response: any) => void) {
    // const [response, setResponse] = useState<any>();
    // const [error, setError] = useState<any>(undefined);

    useEffect(() => {
        window.api.sendAndWait(channel, args)
            .then((result) => {
                // setResponse(result);
                callback(undefined, result);
            })
            .catch((err) => {
                // setError(new Error(`Error when sending and waiting hook.
                // ${err}`));
                callback(new Error(`Error when sending and waiting hook. ${err}`), undefined)
            });

        return () => {
            window.api.removeAllListeners(channel);
        }
    }, []);
}
