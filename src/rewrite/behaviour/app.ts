import { handleAppBeforeQuit } from '@main/electron/appEvents';
import { default as ESH } from '@paymoapp/electron-shutdown-handler';
import { app, autoUpdater } from 'electron';
import {
    DEFAULT_UPDATE_SCHEDULE,
    INTERNET_CONNECTION_SCHEDULE,
    MAIN_WINDOW_INDEX,
    TASK_QUEUE_HIGH_PRIO,
    USER_MODEL_ID
} from '../util/constants';
import { CronKey, createCronSchedule } from '../util/cron';
import { isRunningOnProd } from '../util/environment';
import { LogLevel, log } from '../util/logging';
import { addToQueue, pauseQueue, resumeQueue } from '../util/taskQueue';
import { checkCurrentNetworkConntection } from './network';
import { updateCheck } from './update';
import { getMainWindowNativeHandle, getWindow, showWindow } from './window';

export enum LaunchArg {
    ShowMainWindow = '--show-main-window',
    SquirrelFirstRun = '--squirrel-firstrun'
}

/**
 * This boolean handles if the app wants to be shutdown.
 * EX. if the user closes the main window and the boolean is set to `false` the
 * default event should be prevented.
 */
let isAppQuitting = false;

export function getAppQuittingStatus() {
    return isAppQuitting;
}

export function setAppQuitting() {
    isAppQuitting = true;
}

/**
 * Check if the app is launched with the specified arg.
 */
export function withLaunchArg(arg: LaunchArg) {
    return process.argv.findIndex((foundArg) => foundArg === arg) > -1;
}

/**
 * Check if the app is the primary instance (the only instance which should be running)
 */
export function isPrimaryInstance() {
    log(LogLevel.Info, 'Requested single instance lock');
    return app.requestSingleInstanceLock();
}

/**
 * Relaunch the app with specified args.
 */
export function relaunch(args: LaunchArg[] = []) {
    log(LogLevel.Info, 'Relaunching app');

    setAppQuitting();
    app.relaunch({ args: args });

    handleBeforeQuit();
}

export function handleAppLaunch() {
    /**
     * Handle the process exit if running on production and another instance is
     * already running.
     */
    if (isRunningOnProd() && !isPrimaryInstance()) {
        log(
            LogLevel.Warn,
            'Primary instance already running, exiting newly launched one'
        );
        process.exit();
    }

    app.setAppUserModelId(USER_MODEL_ID);

    // TODO: app init.

    handleGracefulShutdown();

    log(LogLevel.Info, 'Reached end of app launch event');
}

export function handleBeforeQuit() {
    log(LogLevel.Info, 'Reached end of before quit event');
}

export function handleQuit(update: boolean = false) {
    /**
     * If the app want's to update on the quit.
     */
    if (update) {
        log(LogLevel.Info, 'Qutting app for update');
        autoUpdater.quitAndInstall();
        return;
    }

    log(LogLevel.Info, 'Reached end of quit event');
}

export function handleSleep() {
    log(LogLevel.Info, 'PC went to sleep');
    pauseQueue();
}

export function handleWakeUp() {
    log(LogLevel.Info, 'PC woke up');
    resumeQueue();
}

/**
 * This function will get executed when the event gets fired on the primary
 * instance when another instance gets opened.
 */
export function handleSecondInstance() {
    log(
        LogLevel.Info,
        'Displaying primary instance window because another instance was launched'
    );
    showWindow(getWindow(MAIN_WINDOW_INDEX));
}

/**
 * To gracefully shutdown the app on windows this handler is added on app launch.
 * NOTE: Needs to be called after the main window has been created.
 */
function handleGracefulShutdown() {
    /**
     * If running on dev, ignore the handler.
     */
    if (!isRunningOnProd()) {
        return;
    }

    ESH.setWindowHandle(getMainWindowNativeHandle());

    /**
     * The reason displayed.
     */
    ESH.blockShutdown('Gracefully quitting farming');

    ESH.on('shutdown', () => {
        log(LogLevel.Info, 'Gracefully shutting down app');
        handleAppBeforeQuit();
    });

    log(LogLevel.Info, 'Setup graceful shutdown');
}

/**
 * Initializes a couple of things which need to be done before the app is ready.
 */
export function prepareBeforeReady() {
    createCronSchedule(
        CronKey.InternetConnection,
        `*/${INTERNET_CONNECTION_SCHEDULE} * * * *`,
        true,
        () =>
            addToQueue(async () => {
                await checkCurrentNetworkConntection();
            }, TASK_QUEUE_HIGH_PRIO)
    );

    createCronSchedule(
        CronKey.CheckForUpdate,
        `*/${DEFAULT_UPDATE_SCHEDULE} * * * *`, // TODO: replace with setting
        true, // TODO: replace with setting
        () => addToQueue(updateCheck, TASK_QUEUE_HIGH_PRIO)
    );
}
