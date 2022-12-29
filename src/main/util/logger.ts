import * as color from 'ansi-colors';
import dayjs from 'dayjs';
import { app } from 'electron';
import { existsSync } from 'fs';
import { join } from 'path';
import { Constants } from '../common/constants';
import {
    APP_PATH,
    createFile,
    deleteFile,
    writeToFile
} from '../files/handling';
import { getSetting } from '../store';

/**
 * Stores the recent log entries in case of a crash.
 */
const recentLogEntries: string[] = [];

/**
 * Create the `.log` file.
 *
 * The logfile does *not* get created with the written filehandling methods,
 * because it *needs* to exist before something can be logged.
 */
export function initLogger(): void {
    createLogFile();
}

function createLogFile(): void {
    try {
        createFile(
            Constants.LogFileName,
            createLogEntry('MAIN', 'INFO', 'Created logfile')
        );
    } catch (err) {
        log('MAIN', 'FATAL', `Failed creating logfile. ${err}`);
    }
}

function createLogEntry(
    origin: LogOrigin,
    type: LogLevel,
    message: string
): string {
    const currentTimeStamp = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');
    return `[${type}] (${origin}) ${currentTimeStamp} - ${message}\n`;
}

function createTerminalLogEntry(
    origin: LogOrigin,
    type: LogLevel,
    message: string
): string {
    const currentTimeStamp = dayjs().format('YYYY-MM-DD HH:mm:ss.SSS');

    /**
     * Decide type text color.
     */
    let typeText: string;
    if (type === 'FATAL' || type === 'ERROR') {
        typeText = color.bold.red(`[${type}]`);
    } else if (type === 'WARN') {
        typeText = color.bold.yellow(`[${type}]`);
    } else if (type === 'DEBUG') {
        typeText = color.bold.cyan(`[${type}]`);
    } else {
        typeText = color.bold.blue(`[${type}]`);
    }

    /**
     * Process color.
     */
    let originText: string;
    if (origin === 'MAIN') originText = color.bold.green(`(${origin})`);
    else originText = color.bold.magenta(`(${origin})`);

    /**
     * Timestamp color
     */
    const timeStampText = color.gray(`${currentTimeStamp}`);

    /**
     * Actual message color.
     */
    const messageText = color.white(`${message}`);

    /**
     * Build the text from blocks.
     */
    return `${typeText} ${originText} ${timeStampText} - ${messageText}`;
}

export function log(origin: LogOrigin, type: LogLevel, message: any): void {
    const entry: string = createLogEntry(origin, type, message);
    const terminalEntry: string = createTerminalLogEntry(origin, type, message);

    /**
     * Add log to recent entries for crash log.
     */
    recentLogEntries.push(entry);

    /**
     * If in production environment disable debug-type loggings.
     */
    if (
        (!getSetting('application', 'debugLogs')?.value as boolean) &&
        type === 'DEBUG'
    )
        return;

    try {
        /**
         * Only log to the file if it exists.
         */
        if (existsSync(join(APP_PATH, Constants.LogFileName)))
            writeToFile(Constants.LogFileName, `${entry}`, 'a');

        console.log(terminalEntry);

        /**
         * After logging, check if the type is "FATAL".
         * If it is, then soft quit the application.
         */
        if (type === 'FATAL') {
            createCrashLog();
            app.quit();
        }
    } catch (err) {
        console.log(err);
    }
}

/**
 * Create / clear the crash log file with all logs from the current run (recent logs).
 */
function createCrashLog(): void {
    /**
     * Delete the file if its exists.
     */
    if (existsSync(join(APP_PATH, Constants.CrashLogFileName)))
        deleteFile(Constants.CrashLogFileName);

    createFile(Constants.CrashLogFileName, ''.concat(...recentLogEntries));
}
