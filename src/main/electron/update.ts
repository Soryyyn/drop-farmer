import {
    EventChannels,
    IpcChannels,
    Schedules,
    Toasts
} from '@main/common/constants';
import {
    destroyAllFarmWindows,
    stopAllFarmJobs,
    stopAllTimers
} from '@main/farming/management';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import { sendToast } from '@main/util/toast';
import CrontabManager from 'cron-job-manager';
import { app, autoUpdater } from 'electron';
import { getSetting } from '../util/settings';
import { handleOneWay, sendOneWay } from './ipc';
import { destroyTray } from './tray';
import { setAppQuitting } from './windows';

let displayToasts: boolean = false;

/**
 * Cron update job.
 */
const cron = new CrontabManager();
cron.add(Schedules.Update, '*/15 * * * *', () => autoUpdater.checkForUpdates());

export function initUpdater() {
    autoUpdater.setFeedURL({
        url: `https://drop-farmer-release-server.vercel.app/update/${
            process.platform
        }/${app.getVersion()}`
    });
    app.setAppUserModelId('com.squirrel.soryn.DropFarmer');

    setupAppLaunchUpdateRouting();
}

/**
 * Function gets ran on app launch and decides if auto update checking needs to
 * be enabled based on the configured settings.
 *
 * TODO: Maybe create a cron job for stopping and starting the routine for live
 * chaning via settings?
 */
function setupAppLaunchUpdateRouting() {
    if (!(process.argv.indexOf('--squirrel-firstrun') > -1)) {
        if (process.env.NODE_ENV === 'production') {
            if (
                getSetting('application', 'checkForUpdates')?.value as boolean
            ) {
                log('info', 'Auto-update-checking is enabled');
                cron.startAll();
            } else {
                log('info', 'Auto-update-checking is disabled');
            }
        } else {
            log('warn', 'Auto-update-checking is disabled, because of DEV');
        }
    } else {
        log(
            'warn',
            'First run of application after install/update. No automatic update checking enabled'
        );
    }
}

/**
 * React to user wanted actions.
 */
handleOneWay(IpcChannels.updateCheck, () => {
    displayToasts = true;
    if (displayToasts) {
        sendToast({
            type: 'loading',
            id: Toasts.UpdateChecking,
            textOnLoading: 'Checking if update is available...',
            duration: Infinity
        });
    }

    autoUpdater.checkForUpdates();
});
handleOneWay(IpcChannels.installUpdate, () => {
    setAppQuitting(true);
    autoUpdater.quitAndInstall();
});

/**
 * Listening for events.
 */
autoUpdater.on('checking-for-update', () => {
    log('info', 'Currently checking if application can update');

    if (displayToasts) {
        sendToast({
            type: 'loading',
            id: Toasts.UpdateChecking,
            duration: Infinity,
            textOnLoading: 'Checking if update is available...'
        });
    }
});

autoUpdater.on('update-not-available', () => {
    log('info', 'No update available');

    sendOneWay(IpcChannels.updateStatus, false);

    if (displayToasts) {
        sendToast({
            type: 'error',
            id: Toasts.UpdateChecking,
            duration: 4000,
            textOnError: 'No update available.'
        });
    }

    displayToasts = false;
});

autoUpdater.on('update-available', () => {
    log('info', 'Update to application is available, downloading...');
});

autoUpdater.on('update-downloaded', () => {
    log('info', 'Update has finished downloading');

    sendOneWay(IpcChannels.updateStatus, true);

    if (displayToasts) {
        sendToast({
            type: 'success',
            id: Toasts.UpdateChecking,
            duration: 4000,
            textOnSuccess: 'Update available.'
        });
    }

    displayToasts = false;
});

autoUpdater.on('before-quit-for-update', () => {
    destroyTray();
    stopAllFarmJobs();
    stopAllTimers();
    destroyAllFarmWindows();
});

autoUpdater.on('error', (err) => {
    log('error', `Failed downloading / installing update. ${err}`);

    sendOneWay(IpcChannels.updateStatus, false);

    if (displayToasts) {
        sendToast({
            type: 'error',
            id: Toasts.UpdateChecking,
            duration: 4000,
            textOnError:
                'Error occured while checking for update. Please check the logfile.'
        });
    }

    displayToasts = false;
});

/**
 * Stop and resume update job on PC sleep or resume
 */
listenForEvent(EventChannels.PCWentToSleep, () => {
    cron.stopAll();
});

listenForEvent(EventChannels.PCWokeUp, () => {
    if (getSetting('application', 'checkForUpdates')?.value as boolean) {
        log('info', 'Auto-update-checking is enabled');
        cron.startAll();
    }
});
