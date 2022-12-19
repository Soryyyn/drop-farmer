import { app, autoUpdater } from 'electron';
import { Channels } from '../common/channels';
import { updateConfigFile } from '../config';
import { destroyAllFarmWindows } from '../farms/management';
import { log } from '../util/logger';
import { getSettings, getSpecificSetting } from '../util/settings';
import { sendForcedTypeToast } from '../util/toast';
import { handleOneWay, sendOneWay } from './ipc';
import { destroyTray } from './tray';
import { getMainWindow, setAppQuitting } from './windows';

let displayToasts: boolean = false;

app.setAppUserModelId('com.squirrel.soryn.DropFarmer');

const updateURL: string = `https://drop-farmer-release-server.vercel.app/update/${
    process.platform
}/${app.getVersion()}`;
autoUpdater.setFeedURL({ url: updateURL });

/**
 * Check if "--squirrel-firstrun" is in startup args, and don't auto-update.
 */
function checkIfFirstRun(): boolean {
    return process.argv.indexOf('--squirrel-firstrun') > -1;
}

/**
 * Only start the auto-checking for updates after the first run.
 */
if (!checkIfFirstRun()) {
    if (process.env.NODE_ENV === 'production') {
        if (
            getSpecificSetting('application', 'checkForUpdates')
                .value as boolean
        ) {
            log('MAIN', 'DEBUG', 'Auto-update-checking is enabled');
            setInterval(() => {
                autoUpdater.checkForUpdates();
            }, 900000);
        } else {
            log('MAIN', 'WARN', 'Auto-update-checking is disabled');
        }
    } else {
        log('MAIN', 'WARN', 'Auto-update-checking is disabled, because of DEV');
    }
} else {
    log(
        'MAIN',
        'WARN',
        'First run of application after install/update. No automatic update checking enabled'
    );
}

handleOneWay(Channels.updateCheck, () => {
    autoUpdater.checkForUpdates();

    displayToasts = true;

    if (displayToasts) {
        sendForcedTypeToast({
            id: 'update-checking-toast',
            text: 'Checking if update is available...',
            duration: Infinity,
            type: 'loading'
        });
    }
});

handleOneWay(Channels.installUpdate, () => {
    setAppQuitting(true);
    autoUpdater.quitAndInstall();
});

autoUpdater.on('checking-for-update', () => {
    log('MAIN', 'INFO', 'Currently checking if application can update');

    if (displayToasts) {
        sendForcedTypeToast({
            id: 'update-checking-toast',
            text: 'Checking if update is available...',
            duration: Infinity,
            type: 'loading'
        });
    }
});

autoUpdater.on('update-not-available', () => {
    log('MAIN', 'INFO', 'No update available');

    sendOneWay(getMainWindow(), Channels.updateStatus, false);

    if (displayToasts) {
        sendForcedTypeToast({
            id: 'update-checking-toast',
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

    sendOneWay(getMainWindow(), Channels.updateStatus, true);

    if (displayToasts) {
        sendForcedTypeToast({
            id: 'update-checking-toast',
            text: 'Update available.',
            duration: 4000,
            type: 'success'
        });
    }

    displayToasts = false;
});

autoUpdater.on('before-quit-for-update', () => {
    updateConfigFile();
    destroyTray();
    destroyAllFarmWindows();
});

/**
 * If an error happens during any step of updating, checking for updates,
 * downloading updates, etc.
 */
autoUpdater.on('error', (err) => {
    log('MAIN', 'ERROR', `Failed downloading / installing update. ${err}`);

    sendOneWay(getMainWindow(), Channels.updateStatus, false);

    displayToasts = true;

    if (displayToasts) {
        sendForcedTypeToast({
            id: 'update-checking-toast',
            text: 'Error occured while checking for update. Please check the logfile.',
            duration: 4000,
            type: 'error'
        });
    }

    displayToasts = false;
});
