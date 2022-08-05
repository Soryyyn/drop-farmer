import { schedule } from "node-cron";
import { Channels } from "./common/channels";
import { createFile, readFile, writeToFile } from "./fileHandling";
import { sendOneWay } from "./ipc";
import { log } from "./logger";
import { checkIfNoWindows, createFarmWindow, getMainWindow } from "./windows";

const FILE_NAME: string = "farms.json";
const DEFAULT_FARMS_FILE: FarmsFile = {
    uptime: 0,
    farms: []
};
let farmsStatus: FarmStatusObject[] = [];
let farmWindows: FarmWindow[] = [];

/**
 * Initialize the farms file, continuosly check if farming is available and set
 * the default farms status.
 */
export function initFarms(): void {
    createFarmsFile();
    setDefaultFarmsStatus();
    createFarmWindowArrays();

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

    /**
     * For each enabled farm, check if application can farm.
     * Farm if it's possible.
     * And idle if there are no more windows.
     */
    enabledFarms.forEach((farm: Farm) => {

        //TODO: change back to */30 * * * * on prod build.
        schedule("* * * * *", () => {
            /**
             * Set the farm status to "checking".
             */
            let farmStatus: FarmStatusObject = setFarmStatus(farm, "checking");
            sendOneWay(getMainWindow(), Channels.farmStatusChange, farmStatus);

            /**
             * Create the window.
             */
            createFarmWindow(farm);

            /**
             * Check if there are any more farm windows left.
             * TODO: Move to automatic window closing and check if there are any
             * more windows left.
             */
            // if (checkIfNoWindows(farm)) {
            //     let farmStatus: FarmStatusObject = setFarmStatus(farm, "idle");
            //     sendOneWay(getMainWindow(), Channels.farmStatusChange, farmStatus);
            // }
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

/**
 * Set the farms status to the default which is idle.
 * If the farm is disabled in the settings, then set the state as disabled.
 */
function setDefaultFarmsStatus(): void {
    let farms: Farm[] = getFarms();

    farms.forEach((farm) => {
        farmsStatus.push({
            id: farm.id,
            status: (!farm.enabled) ? "disabled" : "idle"
        })

        /**
         * Set the farm status to "disabled" or "idle" on status initialization.
         */
        let farmStatus: FarmStatusObject = setFarmStatus(farm, (!farm.enabled) ? "disabled" : "idle");
        sendOneWay(getMainWindow(), Channels.farmStatusChange, farmStatus);
    });
}

/**
 * Get the status of the wanted farm.
 *
 * @param {Farm} farm The farm which to get the status from.
 * @returns {FarmStatus} The status of the wanted farm.
 */
function getFarmStatus(farm: Farm): FarmStatusObject {
    let farmStatus: FarmStatusObject = farmsStatus.filter((farmStatus: FarmStatusObject) => farmStatus.id === farm.id)[0];
    return farmStatus;
}

/**
 * Get all farms status.
 *
 * @returns All farms status.
 */
export function getFarmsStatus(): FarmStatusObject[] {
    return farmsStatus;
}

/**
 * Set the status of a farm.
 *
 * @param farm The farm to set the status of.
 * @param newStatus The new status to apply to the farm status object.
 * @returns The new farm status object with the newly applied status.
 */
export function setFarmStatus(farm: Farm, newStatus: FarmStatus): FarmStatusObject {
    let temp: FarmStatusObject = getFarmStatus(farm);

    return {
        id: temp.id,
        status: newStatus
    }
}

/**
 * Initialize the farm windows array with 0 windows per farm.
 */
function createFarmWindowArrays(): void {
    let farms = getFarms();

    farms.forEach((farm: Farm) => {
        farmWindows.push({
            id: farm.id,
            windows: []
        });
    });
}

/**
 * Adds the created browser window to the array of the specified farm.
 *
 * @param {Farm} farm The farm to which to add the browser window to.
 * @param {Electron.BrowserWindow} window The newly created browser window.
 */
export function addFarmWindowToArray(farm: Farm, window: Electron.BrowserWindow): void {
    farmWindows.forEach((farmWindow: FarmWindow) => {
        if (farmWindow.id === farm.id) {
            farmWindow.windows.push(window);
        }
    });
}

/**
 * Returns the farm windows array.
 */
export function getFarmWindows(): FarmWindow[] {
    return farmWindows;
}