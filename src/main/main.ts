import { app, powerMonitor } from 'electron';
import {
    handleAppBeforeQuit,
    handleAppQuit,
    handleAppReady,
    handlePCSleep,
    handlePCWakeUp,
    handleRendererProcessGone,
    handleSecondInstanceOpened
} from './electron/appEvents';
import './electron/ipc';
import './util/internet';
import { initPuppeteerConnection } from './util/puppeteer';

/**
 * Handling the creating/deletion of shortcuts when installing/uninstalling via squirrel.
 */
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * Is called before electron is ready.
 */
initPuppeteerConnection();

/**
 * Handle app events.
 */
app.on('ready', async () => await handleAppReady());
app.on('before-quit', (event) => handleAppBeforeQuit(event));
app.on('quit', () => handleAppQuit());
app.on('render-process-gone', handleRendererProcessGone);
app.on('second-instance', () => handleSecondInstanceOpened());

/**
 * Handle powermonitor events.
 */
powerMonitor.on('suspend', async () => await handlePCSleep());
powerMonitor.on('resume', async () => await handlePCWakeUp());
