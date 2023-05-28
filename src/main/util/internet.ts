import { Schedules, Toasts } from '@main/util/constants';
import CrontabManager from 'cron-job-manager';
import isOnline from 'is-online';
import { log } from './logging';
import { sendToast } from './toast';

const schedule: number = 2;
let isConnectedToInternet: boolean = true;

/**
 * Cron timer to check if the user still connected.
 */
export async function internetConectionListener(): Promise<void> {
    const lastConnectionStatus = isConnectedToInternet;
    isConnectedToInternet = await isOnline();

    log(
        'info',
        `Checked for internet connection, connection: ${isConnectedToInternet.toString()}`
    );

    /**
     * If no change in connection.
     */
    if (isConnectedToInternet === lastConnectionStatus) {
        return;
    }

    if (!isConnectedToInternet && lastConnectionStatus) {
        sendToast({
            toast: {
                type: 'error',
                id: Toasts.InternetConnection,
                textOnError: 'No internet connection',
                duration: Infinity
            }
        });
    } else if (isConnectedToInternet && !lastConnectionStatus) {
        sendToast({
            toast: {
                type: 'success',
                id: Toasts.InternetConnection,
                textOnError: 'Connected to internet',
                duration: 4000
            }
        });
    }
}

/**
 * Set up the cron schedule.
 */
new CrontabManager(
    Schedules.InternetConnection,
    `*/${schedule} * * * *`,
    internetConectionListener,
    {
        start: true
    }
);
