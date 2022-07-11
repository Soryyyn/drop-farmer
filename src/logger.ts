import dayjs from "dayjs";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";
import { APP_PATH, writeToFile } from "./fileHandling";

/**
 * Logger singleton which writes log entries to log file on desired actions.
 */
class Logger {
    private _fileName: string = ".log";

    /**
     * Constructor empty because no action is needed to perform here
     * (for now).
     */
    constructor() { }

    /**
     * Creates an appropriate log entry for the log file with timestamp, type and message.
     *
     * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
     * @param {string} message Message to include in log entry.
     * @returns {string} Prepared log entry.
     */
    private createLogEntry(type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): string {
        let currentTimeStamp = dayjs().format("YYYY-MM-DD HH:mm:ss:SSS");
        return `[${type}] ${currentTimeStamp} - ${message}\n`;
    }

    /**
     * Create the ".log" file.
     * The logfile does *not* get created with the written filehandling methods,
     * because it is needed for loggin.
     *
     * @returns {void}
     */
    public createLogFile(): void {
        if (existsSync(join(join(APP_PATH), this._fileName))) {
            this.log("INFO", "Log file already exists, skipping creation...");
            return;
        }

        try {
            writeFileSync(join(join(APP_PATH), this._fileName), this.createLogEntry("INFO", `Created log file.`));
        } catch (err) {
            throw new Error(`Could not create file \"${this._fileName}\" at \"${join(APP_PATH)}\". Reason: ${err}`);
        }
    }

    /**
     * Logs (writes) a log entry into the ".log" file in the app dir.
     *
     * @param {"FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG"} type Type of log entry to make.
     * @param {string} message Message to log.
     */
    public log(type: "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG", message: string): void {
        let entry = this.createLogEntry(type, message);

        try {
            writeToFile(this._fileName, entry, "a");
        } catch (err) {
            console.log(err);
        }
    }
}

/**
 * Create the Logger class instance and freeze it to prevent mutation.
 * Export the frozen instance to make it a singleton.
 */
const loggerInstance = new Logger();
Object.freeze(loggerInstance);
export default loggerInstance;