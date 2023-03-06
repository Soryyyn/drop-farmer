import { app, powerMonitor } from 'electron';
import { EventChannels } from './common/constants';
import {
    handleAppBeforeQuit,
    handleAppQuit,
    handleAppReady
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

app.on('before-quit', (event) => handleAppBeforeQuit(event));

app.on('quit', () => handleAppQuit());

powerMonitor.on('suspend', () => {
    log('info', 'PC went to sleep');
    emitEvent(EventChannels.PCWentToSleep);
});

powerMonitor.on('resume', () => {
    log('info', 'PC woke up');
    emitEvent(EventChannels.PCWokeUp);
});
