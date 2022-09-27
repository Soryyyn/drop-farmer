import * as color from "ansi-colors";
import dayjs from "dayjs";
import { app } from "electron";
import { existsSync } from "fs";
import { join } from "path";
import { APP_PATH, createFile, deleteFile, writeToFile } from "../files/handling";

const FILE_NAME: string = ".log";
const CRASHLOG_FILE_NAME = "crash.log";
const recentLogs: string[] = [];
let debugLogsEnabled: boolean = false;

/**
 * Create the `.log` file.
 *
 * The logfile does *not* get created with the written filehandling methods,
 * because it *needs* to exist before something can be logged.
 */
export function initLogger(): void {
    createLogFile();
}

/**
 * Create the logfile.
 */
function createLogFile(): void {
    try {
        createFile(FILE_NAME, createLogEntry("MAIN", "INFO", "Created logfile"));
    } catch (err) {
        log("MAIN", "FATAL", `Failed creating logfile. ${err}`);
    }
}

/**
 * Creates an appropriate log entry for the log file with timestamp,
 * type and message.
 *
 * @param {"MAIN" | "RENDERER"} origin From which origin the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createLogEntry(origin: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
    return `[${type}] (${origin}) ${currentTimeStamp} - ${message}\n`;
}

/**
 * Creates an appropriate log entry for the the terminal with colors.
 *
 * @param {"MAIN" | "RENDERER"} origin From which origin the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createTerminalLogEntry(origin: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");

    /**
     * Decide type text color.
     */
    let typeText: string;
    if (type === "FATAL" || type === "ERROR") {
        typeText = color.bold.red(`[${type}]`);
    } else if (type === "WARN") {
        typeText = color.bold.yellow(`[${type}]`);
    } else if (type === "DEBUG") {
        typeText = color.bold.cyan(`[${type}]`);
    } else {
        typeText = color.bold.blue(`[${type}]`);
    }

    /**
     * Process color.
     */
    let originText: string;
    if (origin === "MAIN")
        originText = color.bold.green(`(${origin})`);
    else
        originText = color.bold.magenta(`(${origin})`);

    /**
     * Timestamp color
     */
    let timeStampText = color.gray(`${currentTimeStamp}`);

    /**
     * Actual message color.
     */
    let messageText = color.white(`${message}`);

    /**
     * Build the text from blocks.
     */
    return `${typeText} ${originText} ${timeStampText} - ${messageText}`;
}

/**
 * Logs (writes) a log entry into the ".log" file in the app dir.
 *
 * @param {"MAIN" | "RENDERER"} origin From which origin the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to log.
 */
export function log(origin: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: any): void {
    let entry: string = createLogEntry(origin, type, message);
    let terminalEntry: string = createTerminalLogEntry(origin, type, message);

    /**
     * Add log to recent entries for crash log.
     */
    recentLogs.push(entry);

    /**
     * If in production environment disable debug-type loggings.
     */
    if (!debugLogsEnabled && type === "DEBUG")
        return;

    try {
        /**
         * Only log to the file if it exists.
         */
        if (existsSync(join(APP_PATH, FILE_NAME)))
            writeToFile(FILE_NAME, `${entry}`, "a");

        console.log(terminalEntry);

        /**
         * After logging, check if the type is "FATAL".
         * If it is, then soft quit the application.
         */
        if (type === "FATAL") {
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
    if (existsSync(join(APP_PATH, CRASHLOG_FILE_NAME)))
        deleteFile(CRASHLOG_FILE_NAME);

    createFile(CRASHLOG_FILE_NAME, "".concat(...recentLogs));
}

/**
 * Enable or disable the debug logs.
 *
 * @param {boolean} enabled Value for the new debug logs.
 */
export function debugLogs(enabled: boolean): void {
    debugLogsEnabled = enabled;
}