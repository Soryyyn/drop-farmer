import ElectronShutdownHandler from '@paymoapp/electron-shutdown-handler';
import { app, session } from 'electron';
import { createTray, destroyTray } from './electron/tray';
import { initUpdater } from './electron/update';
import {
    createMainWindow,
    getMainWindow,
    setAppQuitting
} from './electron/windows';
import {
    destroyAllFarmWindows,
    initFarmsManagement,
    stopAllFarmJobs,
    stopAllTimers
} from './farming/management';
import { internetConnectionChecker } from './util/internet';
import { log } from './util/logging';
import { initPowermonitor } from './util/powermonitor';
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
initPowermonitor();

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
    ElectronShutdownHandler.on('shutdown', () => {
        log('info', 'Received shutdown event, shutting down now');

        /**
         * Stop all cron jobs, to prevent unfulfilled promises.
         */
        destroyTray();
        stopAllFarmJobs();
        stopAllTimers();
        destroyAllFarmWindows();

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
app.on('before-quit', () => {
    destroyTray();
    stopAllFarmJobs();
    stopAllTimers();
    destroyAllFarmWindows();

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
