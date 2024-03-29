import { useEffect } from 'react';

interface Props {
    channel: any;
    dependency?: React.DependencyList;
    callback: (event: any, response: any) => void;
}

/**
 * Hook to react to a one-way ipc signal received from the main process.
 *
 * @param {string} channel The ipc channel to handle the signal for.
 * @param {any[]} dependencies The dependencies to depend on for the signal.
 * @param {(event: any, response: any) => void} callback The received signal
 * from the ipc event.
 */
export function useHandleOneWay({ channel, dependency, callback }: Props) {
    useEffect(() => {
        window.api.handleOneWay(channel, (event: any, response: any) => {
            callback(event, response);
        });

        return () => {
            window.api.removeAllListeners(channel);
        };
    }, [dependency]); // eslint-disable-line react-hooks/exhaustive-deps
}
