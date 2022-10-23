import { useEffect } from "react";

/**
 * Hook to react to a one-way ipc signal received from the main process.
 *
 * @param {string} channel The ipc channel to handle the signal for.
 * @param {any[]} dependencies The dependencies to depend on for the signal.
 * @param {(event: any, response: any) => void} callback The received signal
 * from the ipc event.
 */
export function useHandleOneWay(channel: string, dependency: any, callback: (event: any, response: any) => void) {
    useEffect(() => {
        window.api.handleOneWay(channel, (event: any, response: any) => {
            callback(event, response);
        });

        return () => {
            window.api.removeAllListeners(channel);
        }
    }, [dependency]);
}

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 */
export function useSendAndWait(channel: string, args: any, callback: (err: any, response: any) => void) {
    useEffect(() => {
        window.api.sendAndWait(channel, args)
            .then((result) => {
                callback(undefined, result);
            })
            .catch((err) => {
                callback(new Error(`Error when sending and waiting hook. ${err}`), undefined)
            });

        return () => {
            window.api.removeAllListeners(channel);
        }
    }, []);
}

/**
 * Handle a click outside of a reference.
 *
 * @param {any} ref The reference to the element which will be checked if it is *not* clicked.
 * @param {() => void} callback The callback to execute
 * when the reference is not clicked.
 */
export function useOutsideAlterter(ref: any, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (ref.current && !ref.current.contains(event.target))
                callback();
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [ref]);
}