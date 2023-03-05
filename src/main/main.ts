import { app, powerMonitor } from 'electron';
import { EventChannels } from './common/constants';
import './electron/ipc';
import { handleClientShutdown } from './electron/shutdownHandler';
import { createTray, destroyTray } from './electron/tray';
import { initUpdater } from './electron/update';
import { createMainWindow } from './electron/windows';
import { initFarmsManagement, stopFarms } from './farming/management';
import { emitEvent } from './util/events';
import './util/internet';
import { log } from './util/logging';
import { initPuppeteerConnection } from './util/puppeteer';

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
    createTray();
    createMainWindow();
    handleClientShutdown();
});

/**
 * Quitting routine.
 */
app.on('before-quit', async () => {
    destroyTray();
    await stopFarms();
});

/**
 * When quitting routine has finished.
 */
app.on('quit', () => {
    log('info', 'Quitting application');
    process.exit();
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
