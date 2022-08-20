import * as color from "ansi-colors";
import dayjs from "dayjs";
import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { APP_PATH, writeToFile } from "./fileHandling";

const FILE_NAME: string = ".log";

/**
 * Create the ".log" file.
 *
 * The logfile does *not* get created with the written filehandling methods,
 * because it *needs* to exist before something can be logged.
 *
 * @returns void
 */
export function initLogger(): void {
    if (existsSync(join(join(APP_PATH), FILE_NAME))) {
        // File already exists, skipping creation.
        return;
    }

    try {
        writeFileSync(join(join(APP_PATH), FILE_NAME), "");
    } catch (err) {
        throw new Error(`Could not create file \"${FILE_NAME}\" at \"${join(APP_PATH)}\". Reason: ${err}`);
    }
}

/**
 * Creates an appropriate log entry for the log file with timestamp,
 * type and message.
 *
 * @param {"MAIN" | "RENDERER"} process From which process the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createLogEntry(process: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
    return `[${type}] (${process}) ${currentTimeStamp} - ${message}\n`;
}

/**
 * Creates an appropriate log entry for the the terminal with colors.
 *
 * @param {"MAIN" | "RENDERER"} process From which process the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createTerminalLogEntry(process: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
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
    let processText: string;
    if (process === "MAIN")
        processText = color.bold.green(`(${process})`);
    else
        processText = color.bold.magenta(`(${process})`);

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
    return `${typeText} ${processText} ${timeStampText} - ${messageText}`;
}

/**
 * Logs (writes) a log entry into the ".log" file in the app dir.
 *
 * @param {"MAIN" | "RENDERER"} process From which process the log is coming from.
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to log.
 */
export function log(process: "MAIN" | "RENDERER", type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: any): void {
    let entry = createLogEntry(process, type, message);
    let terminalEntry = createTerminalLogEntry(process, type, message);
    try {
        console.log(terminalEntry);
        writeToFile(FILE_NAME, `${entry}`, "a");
    } catch (err) {
        console.log(err);
    }
}