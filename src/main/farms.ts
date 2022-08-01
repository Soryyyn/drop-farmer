import { schedule } from "node-cron";
import { createFile, readFile, writeToFile } from "./fileHandling";
import { log } from "./logger";

const FILE_NAME: string = "farms.json";
const DEFAULT_FARMS_FILE: FarmsFile = {
    uptime: 0,
    farms: []
};

/**
 * Initialize the farms file.
 */
export function initFarms(): void {
    createFarmsFile();
    checkIfNeedsToFarm();
}

/**
 * Gets all currently saved farms from the farms file.
 *
 * @returns {Farm[]} All currently saved farms.
 */
export function getFarms(): Farm[] {
    return readFarmsFile().farms;
}

/**
 * Check all farms if application can farm and if they are enabled.
 */
export function checkIfNeedsToFarm(): void {
    let enabledFarms = getFarms().filter(farm => farm.enabled);

    // for each enabled farm, check if application can farm
    enabledFarms.forEach((farm: Farm) => {
        schedule("*/30 * * * *", () => {
            console.log("checking farm:");
            console.log(farm);
        });
    });
}

/**
 * Create the farms file.
 */
function createFarmsFile(): void {
    try {
        createFile(FILE_NAME, JSON.stringify(DEFAULT_FARMS_FILE, null, 4));
    } catch (err) {
        // TODO: send event for error?
        log("FATAL", `Failed creating farms file. Drop-farmer can't work without the farms file. Error message:\n\t"${err}"`);
    }
}

/**
 * Read the current farms file.
 *
 * @returns {FarmsFile} Current farms file.
 */
function readFarmsFile(): FarmsFile {
    try {
        let fileData = readFile(FILE_NAME);
        return JSON.parse(fileData);
    } catch (err) {
        // TODO: send event for error?
        log("ERROR", `Failed reading farms file. Error message:\n\t"${err}"`);
        return DEFAULT_FARMS_FILE;
    }
}

/**
 * Re-writes the farms file with the new data given.
 *
 * @param {FarmsFile} newData New data to write to the farms file.
 */
function writeToFarmsFile(newData: FarmsFile): void {
    try {
        writeToFile(FILE_NAME, JSON.stringify(newData, null, 4), "w");
    } catch (err) {
        log("ERROR", `Failed to update farms file. Error message:\n\t"${err}"`);
    }
}