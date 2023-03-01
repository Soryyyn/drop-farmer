import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { app, powerMonitor, session } from 'electron';
import { EventChannels } from './common/constants';
import { createTray, destroyTray } from './electron/tray';
import { initUpdater } from './electron/update';
import {
    createMainWindow,
    getMainWindow,
    setAppQuitting
} from './electron/windows';
import { initFarmsManagement, stopFarms } from './farming/management';
import { emitEvent } from './util/events';
import { internetConnectionChecker } from './util/internet';
import { log } from './util/logging';
import { initPuppeteerConnection } from './util/puppeteer';

/**
 * If application is in run in production environment.
 */
const inProd: boolean = process.env.NODE_ENV === 'production';

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require('electron-squirrel-startup')) {
    app.quit();
}

initFarmsManagement();
initPuppeteerConnection();
initUpdater();

/**
 * Gets executed when electron has finished starting.
 * Some API's might only be available after it has started.
 */
app.whenReady().then(() => {
    /**
     * Check if app needs to clear cache.
     */
    if (process.env.CLEAR_CACHE && process.env.CLEAR_CACHE!.trim() == '1') {
        log('warn', 'Cleared application session data');
        session.defaultSession.clearStorageData();
    }

    /**
     * Create the system tray.
     */
    createTray(inProd);

    /**
     * Create the actual application window and show it when it has
     * been created (if set).
     */
    createMainWindow(inProd);

    /**
     * Repeatedly check the internet connection.
     *
     * Only initializing after the main window has been created to
     * avoid fatal crash.
     */
    internetConnectionChecker();

    /**
     * Load all ipc listeners when the app is ready.
     */
    require('./electron/ipc');

    /**
     * Block the shutdown process.
     * And set the native window handle for handling windows shutdown events.
     * e.x. blocking it while the farms are checking.
     */
    ElectronShutdownHandler.setWindowHandle(
        getMainWindow().getNativeWindowHandle()
    );
    log(
        'info',
        'Preventing system from shutting down before application savely quits'
    );
    ElectronShutdownHandler.blockShutdown('Please wait for graceful shutdown');

    /**
     * React to the windows shutdown event firing.
     */
    ElectronShutdownHandler.on('shutdown', async () => {
        log('info', 'Received shutdown event, shutting down now');

        /**
         * Stop all cron jobs, to prevent unfulfilled promises.
         */
        destroyTray();
        await stopFarms();

        /**
         * Allow app to shutdown.
         */
        ElectronShutdownHandler.releaseShutdown();
        setAppQuitting(true);
        app.quit();
    });
});

/**
 * Quitting routine.
 */
app.on('before-quit', async () => {
    destroyTray();
    await stopFarms();

    /**
     * Hard quit the app.
     */
    process.exit();
});

/**
 * When quitting routine has finished.
 */
app.on('quit', () => {
    log('info', 'Quitting application');
});

/**
 * Handle darwin quits.
 */
app.on('window-all-closed', () => {
    if (process.platform != 'darwin') app.quit();
});

/**
 * When client goes to sleep.
 */
powerMonitor.on('suspend', () => {
    log('info', 'PC went to sleep');
    emitEvent(EventChannels.PCWentToSleep);
});

/**
 * When client wakes up.
 */
powerMonitor.on('resume', () => {
    log('info', 'PC woke up');
    emitEvent(EventChannels.PCWokeUp);
});
