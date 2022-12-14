import { app, autoUpdater } from 'electron';
import { Channels } from '../common/channels';
import { updateConfigFile } from '../config';
import { destroyAllFarmWindows } from '../farms/management';
import { log } from '../util/logger';
import { handleOneWay, sendOneWay } from './ipc';
import { destroyTray } from './tray';
import { getMainWindow, setAppQuitting } from './windows';

/**
 * Check if "--squirrel-firstrun" is in startup args, and don't auto-update.
 */
function checkIfFirstRun(): boolean {
    return process.argv.indexOf('--squirrel-firstrun') > -1;
}

/**
 * Set the app user model id.
 */
app.setAppUserModelId('com.squirrel.soryn.DropFarmer');

/**
 * The url to point to for updates.
 */
const updateURL: string = `https://drop-farmer-release-server.vercel.app/update/${
    process.platform
}/${app.getVersion()}`;

/**
 * Set the feed url (so the autoupdater knows where to listen for updates).
 */
autoUpdater.setFeedURL({ url: updateURL });

/**
 * Only start the auto-checking for updates after the first run.
 */
if (!checkIfFirstRun()) {
    if (process.env.NODE_ENV === 'production') {
        log('MAIN', 'DEBUG', 'Auto-update-checking is enabled');
        setInterval(() => {
            autoUpdater.checkForUpdates();
        }, 900000);
    } else {
        log('MAIN', 'WARN', 'Auto-update-checking is disabled');
    }
} else {
    log(
        'MAIN',
        'WARN',
        'First run of application after install/update. No automatic update checking enabled'
    );
}

autoUpdater.on('checking-for-update', () => {
    log('MAIN', 'INFO', 'Currently checking if application can update');
});

autoUpdater.on('update-not-available', () => {
    log('MAIN', 'INFO', 'No update available');
});

autoUpdater.on('update-available', () => {
    log('MAIN', 'INFO', 'Update to application is available! downloading...');
});

/**
 * When the update is available, show a signal to renderer to display that a
 * update is available.
 */
autoUpdater.on('update-downloaded', () => {
    log('MAIN', 'INFO', 'Update has finished downloading!');
    sendOneWay(getMainWindow(), Channels.updateAvailable);
});

/**
 * `before-quit` will not be fired, so call all function here too.
 */
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
});

/**
 * If the user wants to manually check for updates.
 */
handleOneWay(Channels.updateCheck, () => {
    autoUpdater.checkForUpdates();
});

/**
 * If the user wants to manually install the update.
 */
handleOneWay(Channels.installUpdate, () => {
    setAppQuitting(true);
    autoUpdater.quitAndInstall();
});
