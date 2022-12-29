import CrontabManager from 'cron-job-manager';
import { app, autoUpdater } from 'electron';
import {
    EventChannels,
    IpcChannels,
    Schedules,
    Toasts
} from '../common/constants';
import { destroyAllFarmWindows } from '../farms/management';
import { getSetting } from '../store';
import { listenForEvent } from '../util/events';
import { log } from '../util/logger';
import { sendForcedTypeToast } from '../util/toast';
import { handleOneWay, sendOneWay } from './ipc';
import { destroyTray } from './tray';
import { getMainWindow, setAppQuitting } from './windows';

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
                log('MAIN', 'DEBUG', 'Auto-update-checking is enabled');
                cron.startAll();
            } else {
                log('MAIN', 'WARN', 'Auto-update-checking is disabled');
            }
        } else {
            log(
                'MAIN',
                'WARN',
                'Auto-update-checking is disabled, because of DEV'
            );
        }
    } else {
        log(
            'MAIN',
            'WARN',
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
        sendForcedTypeToast({
            id: Toasts.UpdateChecking,
            text: 'Checking if update is available...',
            duration: Infinity,
            type: 'loading'
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
    log('MAIN', 'INFO', 'Currently checking if application can update');

    if (displayToasts) {
        sendForcedTypeToast({
            id: Toasts.UpdateChecking,
            text: 'Checking if update is available...',
            duration: Infinity,
            type: 'loading'
        });
    }
});

autoUpdater.on('update-not-available', () => {
    log('MAIN', 'INFO', 'No update available');

    sendOneWay(getMainWindow(), IpcChannels.updateStatus, false);

    if (displayToasts) {
        sendForcedTypeToast({
            id: Toasts.UpdateChecking,
            text: 'No update available.',
            duration: 4000,
            type: 'error'
        });
    }

    displayToasts = false;
});

autoUpdater.on('update-available', () => {
    log('MAIN', 'INFO', 'Update to application is available! downloading...');
});

autoUpdater.on('update-downloaded', () => {
    log('MAIN', 'INFO', 'Update has finished downloading!');

    sendOneWay(getMainWindow(), IpcChannels.updateStatus, true);

    if (displayToasts) {
        sendForcedTypeToast({
            id: Toasts.UpdateChecking,
            text: 'Update available.',
            duration: 4000,
            type: 'success'
        });
    }

    displayToasts = false;
});

autoUpdater.on('before-quit-for-update', () => {
    destroyTray();
    destroyAllFarmWindows();
});

autoUpdater.on('error', (err) => {
    log('MAIN', 'ERROR', `Failed downloading / installing update. ${err}`);

    sendOneWay(getMainWindow(), IpcChannels.updateStatus, false);

    if (displayToasts) {
        sendForcedTypeToast({
            id: Toasts.UpdateChecking,
            text: 'Error occured while checking for update. Please check the logfile.',
            duration: 4000,
            type: 'error'
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
        log('MAIN', 'DEBUG', 'Auto-update-checking is enabled');
        cron.startAll();
    }
});
