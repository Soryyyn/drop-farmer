import { app, powerMonitor } from 'electron';
import {
    LaunchArg,
    handleAppLaunch,
    handleBeforeQuit,
    handleQuit,
    handleSecondInstance,
    handleSleep,
    handleWakeUp,
    prepareBeforeReady,
    relaunch,
    withLaunchArg
} from './behaviour/app';

/**
 * Quit the app if it is being installed (needed behaviour).
 */
if (require('electron-squirrel-startup')) {
    app.quit();
}

/**
 * If it's the first squirrel run, updating won't be possible.
 * That's why the app will get relaunched.
 */
if (withLaunchArg(LaunchArg.SquirrelFirstRun)) {
    relaunch();
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
