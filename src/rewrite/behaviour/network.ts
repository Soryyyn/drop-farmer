import isOnline from 'is-online';
import { DEFAULT_TOAST_DURATION } from '../util/constants';
import { ToastId, sendToast } from '../util/toast';

let connection = true;

export async function checkCurrentNetworkConntection() {
    const lastStatus = connection;

    /**
     * Actually check the current network connection.
     */
    connection = await isOnline();

    /**
     * If no connection was established and the status also previously was false.
     */
    if (!connection && lastStatus) {
        sendToast({
            toast: {
                id: ToastId.InternetConnection,
                type: 'error',
                duration: Infinity,
                textOnError:
                    'No network connection found, please connect to the internet'
            }
        });
    }

    /**
     * If a connection was established but previously was not.
     */
    if (connection && !lastStatus) {
        sendToast({
            toast: {
                id: ToastId.InternetConnection,
                type: 'success',
                duration: DEFAULT_TOAST_DURATION,
                textOnSuccess: 'Network connection was established'
            }
        });
    }

    return connection;
}
