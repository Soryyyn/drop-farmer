import { useEffect } from 'react';

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 */
export function useSendAndWait(
    channel: any,
    args: any,
    callback: (err: any, response: any) => void
) {
    useEffect(() => {
        api.sendAndWait(channel, args)
            .then((result) => {
                callback(undefined, result);
            })
            .catch((err) => {
                callback(
                    new Error(`Error when sending and waiting hook. ${err}`),
                    undefined
                );
            });

        return () => {
            api.removeAllListeners(channel);
        };
    }, []);
}
