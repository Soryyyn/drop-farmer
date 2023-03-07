import { app, powerMonitor } from 'electron';
import { EventChannels } from './common/constants';
import {
    handleAppBeforeQuit,
    handleAppQuit,
    handleAppReady,
    handlePCSleep,
    handlePCWakeUp
} from './electron/appEvents';
import './electron/ipc';
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

/**
 * Is called before electron is ready.
 */
initPuppeteerConnection();

app.on('ready', () => handleAppReady());

app.on('before-quit', async (event) => await handleAppBeforeQuit(event));

app.on('quit', () => handleAppQuit());

powerMonitor.on('suspend', async () => await handlePCSleep());

powerMonitor.on('resume', async () => await handlePCWakeUp());
