import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { rmSync } from "original-fs";
import { join } from "path";
import { log } from "../util/logger";

/**
 * The userData (roaming/drop-farmer) directory in production mode.
 * Changes to current root directory when in dev mode.
 */
export const APP_PATH: string =
    process.env.NODE_ENV === "production"
        ? app.getPath("userData")
        : join(__dirname, "../../");

/**
 * Creates a file with given name and data at the app root path.
 *
 * @param {string} fileName Name of the file to create.
 * @param {string|Buffer} data Data which is written to the file on creation.
 */
export function createFile(fileName: string, data: string | Buffer): void {
    if (!existsSync(join(APP_PATH, fileName))) {
        try {
            writeFileSync(join(APP_PATH, fileName), data);
        } catch (err) {
            throw new Error(
                `Could not create file "${fileName}" at "${APP_PATH}". Reason: "${err}"`
            );
        }
    }
}

/**
 * Reads the file with given name at app path and returns the contents as a string.
 * If the file is unavailable (not created), it throws an error.
 *
 * @param {string} fileName Name of the file to read.
 * @returns {string} Contents of the read file.
 */
export function readFile(fileName: string): string {
    if (!existsSync(join(APP_PATH, fileName))) {
        throw new Error(
            `Could not read file "${fileName}" at "${APP_PATH}", because it doesn't exist.`
        );
    } else {
        try {
            return readFileSync(join(APP_PATH, fileName)).toString();
        } catch (err) {
            throw new Error(
                `Could not read file "${fileName}" at "${APP_PATH}". Reason: ${err}`
            );
        }
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
export function writeToFile(
    fileName: string,
    data: string,
    flag: "a" | "w"
): void {
    if (!existsSync(join(APP_PATH, fileName))) {
        throw new Error(
            `Could not read file "${fileName}" at "${APP_PATH}", because it doesn't exist.`
        );
    } else {
        try {
            writeFileSync(join(APP_PATH, fileName), data, { flag: flag });
        } catch (err) {
            throw new Error(
                `Could not write to file "${fileName}" at "${APP_PATH}". Reason: ${err}`
            );
        }
    }
}

/**
 * Delete the specified file.
 *
 * @param {string} fileName The file to delete.
 */
export function deleteFile(fileName: string): void {
    if (!existsSync(join(APP_PATH, fileName))) {
        log("MAIN", "WARN", "Can't delete file which doesn't exist");
    } else {
        try {
            rmSync(join(APP_PATH, fileName));
        } catch (err) {
            throw new Error(
                `Could not delete file "${fileName}" at "${APP_PATH}". Reason: ${err}`
            );
        }
    }
}
