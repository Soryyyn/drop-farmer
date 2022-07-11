import Logger from "./logger";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// NOTE: refactor to more paths if necessary
export const APP_PATH: string = join(__dirname, "..");

/**
 * Gets the path of the wanted file by name.
 *
 * @param {string} fileName Name of the file to get the path of.
 * @returns {string} Path of wanted file.
 */
export function getFilePath(fileName: string): string {
    return join(APP_PATH, fileName);
}

/**
 * Creates a file with given name and data at the app root path.
 *
 * @param {string} fileName Name of the file to create.
 * @param {string|Buffer} data Data which is written to the file on creation.
 */
export function createFile(fileName: string, data: string | Buffer): void {
    if (existsSync(join(APP_PATH, fileName))) {
        Logger.log("INFO", `\"${fileName}\" at \"${APP_PATH}\" already exists, skipping creation...`)
        return;
    }

    Logger.log("INFO", `Creating ${fileName} file...`);
    try {
        writeFileSync(join(APP_PATH, fileName), data);
        Logger.log("INFO", `Created ${fileName} file.`);
    } catch (err) {
        Logger.log("ERROR", `Could not create file \"${fileName}\" at \"${APP_PATH}\". Reason: \"${err}\"`);
        throw new Error(`Could not read file \"${fileName}\" at \"${APP_PATH}\". Reason: ${err}`);
    }
}

/**
 * Reads the file with given name at app path and returns the contents as a string.
 * If the file is available (not created), it throws an error.
 *
 * @param {string} fileName Name of the file to read.
 * @returns {string} Contents of the read file.
 */
export function readFile(fileName: string): string {
    if (!existsSync(join(APP_PATH, fileName))) {
        Logger.log("ERROR", `Could not read file \"${fileName}\" at \"${APP_PATH}\", because it doesn't exist.`);
        throw new Error(`Could not read file \"${fileName}\" at \"${APP_PATH}\", because it doesn't exist.`);
    }

    Logger.log("INFO", `Reading ${fileName} file...`);
    try {
        return readFileSync(join(APP_PATH, fileName)).toString();
    } catch (err) {
        Logger.log("ERROR", `Could not read file \"${fileName}\" at \"${APP_PATH}\". Reason: ${err}`);
        throw new Error(`Could not read file \"${fileName}\" at \"${APP_PATH}\". Reason: ${err}`);
    }
}

/**
 * Writes data to the specified file.
 * Either appends the data to the file or completely overwrites it.
 *
 * @param {string} fileName Name of the file to write to.
 * @param {string} data Data which is written to the file.
 * @param {"a"|"w"} flag Flag which determines *how* to write to the file. (a=append / w=write)
 */
export function writeToFile(fileName: string, data: string, flag: "a" | "w"): void {
    if (!existsSync(join(APP_PATH, fileName))) {
        Logger.log("ERROR", `Could not read file \"${fileName}\" at \"${APP_PATH}\", because it doesn't exist.`);
        throw new Error(`Could not read file \"${fileName}\" at \"${APP_PATH}\", because it doesn't exist.`);
    }

    try {
        writeFileSync(join(APP_PATH, fileName), data, { flag: flag })
    } catch (err) {
        Logger.log("ERROR", `Could not read file \"${fileName}\" at \"${APP_PATH}\", because it doesn't exist.`);
        throw new Error(`Could not write to file \"${fileName}\" at \"${APP_PATH}\". Reason: ${err}`);
    }
}