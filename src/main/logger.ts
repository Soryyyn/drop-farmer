import dayjs from "dayjs";
import { writeFileSync, existsSync } from "fs";
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
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to include in log entry.
 * @returns {string} Prepared log entry.
 */
function createLogEntry(type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
    let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss.SSS");
    return `[${type}] ${currentTimeStamp} - ${message}\n`;
}

/**
 * Logs (writes) a log entry into the ".log" file in the app dir.
 *
 * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
 * @param {string} message Message to log.
 */
export function log(type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: any): void {
    let entry = createLogEntry(type, message);

    try {
        writeToFile(FILE_NAME, `${entry}`, "a");
    } catch (err) {
        console.log(err);
    }
}