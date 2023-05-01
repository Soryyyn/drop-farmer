import { useEffect, useState } from 'react';

interface Props {
    channel: any;
    args?: any;
    dependency?: any;
    skipFirstRender?: boolean;
    callback: (err: any, response: any) => void;
}

/**
 * Hook to send and wait for a response from an ipc channel.
 *
 * @param {string} channel The ipc channel to send and wait for a signal for.
 * @param {any} args The arguments to pass to with the signal.
 */
export function useSendAndWait({
    channel,
    args,
    dependency,
    skipFirstRender,
    callback
}: Props) {
    const [first, setFirst] = useState(true);

    useEffect(() => {
        if (skipFirstRender) {
            if (first) setFirst(false);
            else {
                api.sendAndWait(channel, args)
                    .then((result) => {
                        callback(undefined, result);
                    })
                    .catch((err) => {
                        callback(
                            new Error(
                                `Error when sending and waiting hook. ${err}`
                            ),
                            undefined
                        );
                    });
            }
        } else {
            api.sendAndWait(channel, args)
                .then((result) => {
                    callback(undefined, result);
                })
                .catch((err) => {
                    callback(
                        new Error(
                            `Error when sending and waiting hook. ${err}`
                        ),
                        undefined
                    );
                });
        }

        return () => {
            api.removeAllListeners(channel);
        };
    }, [dependency]); // eslint-disable-line react-hooks/exhaustive-deps
}
