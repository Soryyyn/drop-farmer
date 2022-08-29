import * as color from "ansi-colors";
import dayjs from "dayjs";
import { app } from "electron";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { APP_PATH, writeToFile } from "./fileHandling";

const FILE_NAME: string = ".log";

/**
 * Create the `.log` file.
 *
 * The logfile does *not* get created with the written filehandling methods,
 * because it *needs* to exist before something can be logged.
 */
export function initLogger(): void {
    if (existsSync(join(join(APP_PATH), FILE_NAME))) {
        return;
    }

    try {
        writeFileSync(join(APP_PATH, FILE_NAME), "");
    } catch (err) {
        throw new Error(`Could not create file \"${FILE_NAME}\" at \"${join(APP_PATH)}\". Reason: ${err}`);
    }
}

/**
 * Creates an appropriate log entry for the log file with timestamp,
 * type and message.
 *
 * @param {"MAIN" | "RENDERER"} location From which location the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createLogEntry(location: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
    return `[${type}] (${location}) ${currentTimeStamp} - ${message}\n`;
}

/**
 * Creates an appropriate log entry for the the terminal with colors.
 *
 * @param {"MAIN" | "RENDERER"} location From which location the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createTerminalLogEntry(location: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");

    /**
     * Decide type text color.
     */
    let typeText: string;
    if (type === "FATAL" || type === "ERROR") {
        typeText = color.bold.red(`[${type}]`)
    } else if (type === "WARN") {
        typeText = color.bold.yellow(`[${type}]`)
    } else {
        typeText = color.bold.blue(`[${type}]`);
    }

    /**
     * Process color.
     */
    let locationText: string;
    if (location === "MAIN")
        locationText = color.bold.green(`(${location})`);
    else
        locationText = color.bold.magenta(`(${location})`);

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
    return `${typeText} ${locationText} ${timeStampText} - ${messageText}`;
}

/**
 * Logs (writes) a log entry into the ".log" file in the app dir.
 *
 * @param {"MAIN" | "RENDERER"} location From which location the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to log.
 */
export function log(location: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: any): void {
    let entry: string = createLogEntry(location, type, message);
    let terminalEntry: string = createTerminalLogEntry(location, type, message);

    /**
     * If in production environment disable debug-type loggings.
     */
    if ((process.env.NODE_ENV === "production") && type === "DEBUG")
        return;

    try {
        console.log(terminalEntry);
        writeToFile(FILE_NAME, `${entry}`, "a");

        /**
         * After logging, check if the type is "FATAL".
         * If it is, then soft quit the application.
         */
        if (type === "FATAL") {
            app.quit();
        }
    } catch (err) {
        console.log(err);
    }
}