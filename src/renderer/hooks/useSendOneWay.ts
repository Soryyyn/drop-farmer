import { useEffect, useState } from 'react';

interface Props {
    channel: any;
    args?: any;
    dependency?: any;
    skipFirstRender?: boolean;
}

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 */
export function useSendOneWay({
    channel,
    args,
    dependency,
    skipFirstRender
}: Props) {
    const [first, setFirst] = useState(true);

    useEffect(() => {
        if (skipFirstRender) {
            if (first) setFirst(false);
            else {
                window.api.sendOneWay(channel, args);
            }
        } else {
            window.api.sendOneWay(channel, args);
        }

        return () => {
            window.api.removeAllListeners(channel);
        };
    }, [dependency]); // eslint-disable-line react-hooks/exhaustive-deps
}
