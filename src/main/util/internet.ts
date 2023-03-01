import { IpcChannels } from '@main/common/constants';
import { sendOneWay } from '@main/electron/ipc';
import isOnline from 'is-online';
import { log } from './logging';
import { sendToast } from './toast';

/**
 * The current internet connection.
 */
let internetConnection: boolean = false;

/**
 * Repeatedly (every 5s) check the internet connection and notify via ipc.
 */
export function internetConnectionChecker(): void {
    isOnline()
        .then((connection: boolean) => {
            internetConnection = connection;

            /**
             * If user has no internet connection, notify via toast.
             */
            if (!connection) {
                sendToast({
                    toast: {
                        type: 'error',
                        id: 'no-internet',
                        textOnError: 'No internet connection.',
                        duration: 4000
                    }
                });

                sendOneWay(IpcChannels.internet, false);
            }
        })
        .catch((err) => {
            log('error', `Error checking internet connection. ${err}`);
        });

    /**
     * Recursive calling.
     */
    setTimeout(internetConnectionChecker, 15000);
}

/**
 * Returns the current internet connection.
 */
export async function getCurrentInternetConnection(): Promise<boolean> {
    return internetConnection;
}
