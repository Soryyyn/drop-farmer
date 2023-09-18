import { app, powerMonitor } from 'electron';
import {
    handleAppLaunch,
    handleBeforeQuit,
    handleQuit,
    handleSecondInstance,
    handleSleep,
    handleWakeUp,
    prepareBeforeReady
} from './behaviour/app';

/**
 * Quit the app if it is being installed (needed behaviour).
 */
if (require('electron-squirrel-startup')) {
    app.quit();
}

prepareBeforeReady();

/**
 * Listened for app & client events.
 */
app.on('ready', () => handleAppLaunch());
app.on('second-instance', () => handleSecondInstance());
app.on('before-quit', () => handleBeforeQuit());
app.on('quit', () => handleQuit());
powerMonitor.on('suspend', () => handleSleep());
powerMonitor.on('resume', () => handleWakeUp());
