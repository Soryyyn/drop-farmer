import { createFile, readFile } from "./fileHandling";
import { GameFarmTemplate } from "./games/gameFarmTemplate";
import { LOL } from "./games/lol";
import { log } from "./logger";
import { destroyWindow } from "./windows";

/**
 * The cache file name.
 */
const CACHE_FILE_NAME: string = "farms_cache.json";

/**
 * All the farms in array to access.
 */
const FARMS: GameFarmTemplate[] = [
    new LOL(),
];

/**
 * Initizalize all farms and create the cache file for the farms to use if it
 * doesn't exist already.
 *
 * Go through each farm and start the schedule to farm.
 */
export function initFarms(): void {
    createCacheFile();
    readCacheFile();

    FARMS.forEach((farm: GameFarmTemplate) => {
        farm.scheduleCheckingFarm();
    });
}

/**
 * Create the cache file.
 * File does *not* get created if it already exists.
 */
function createCacheFile(): void {
    try {
        const cache: FarmsCacheFile = {
            uptime: 0,
            farms: []
        };

        FARMS.forEach((farm: GameFarmTemplate) => {
            cache.farms.push(farm.getCacheDataData());
        });

        createFile(CACHE_FILE_NAME, JSON.stringify(cache, null, 4));
    } catch (err) {
        // TODO: send event for error?
        log("FATAL", `Failed creating farms cache file. Drop-farmer will only use the default configurations without the cache file and wont track progress. Error message:\n\t"${err}"`);
    }
}

/**
 * Reads the cache file and sets the data of each farm from the cache.
 * If not cache is read or an error occurs the default farm configurations will be used.
 */
function readCacheFile(): void {
    try {
        const cacheData: FarmsCacheFile = JSON.parse(readFile(CACHE_FILE_NAME));

        /**
         * Go through each farm cache and load each one respectively into each farm.
         */
        cacheData.farms.forEach((cache: Farm) => {
            FARMS.forEach((farm: GameFarmTemplate) => {
                if (cache.gameName === farm.gameName)
                    farm.setCachedFarmData(cache);
            });
        });
    } catch (err) {
        // TODO: send event for error?
        log("ERROR", `Failed reading farms cache file. Error message:\n\t"${err}"`);
    }
}

/**
 * Get all farm data for renderer process.
 */
export function getFarmsForRenderer(): FarmRendererObject[] {
    const farms: any[] = [];
    FARMS.forEach((farm: GameFarmTemplate) => {
        farms.push({
            gameName: farm.gameName,
            status: farm.status
        });
    });
    return farms;
}

/**
 * Returns all the available farms.
 */
export function getFarms(): GameFarmTemplate[] {
    return FARMS;
}

/**
 * Go through each farm and close all windows.
 */
export function destroyAllWindows(): void {
    log("INFO", "Destroying all windows");
    FARMS.forEach((farm: GameFarmTemplate) => {
        /**
         * Check if farm windows are available.
         * If yes, destroy them.
         */
        if (farm.farmingWindows.length > 0) {
            farm.farmingWindows.forEach((window: Electron.BrowserWindow) => {
                destroyWindow(window);
            });
        }

        /**
         * Destroy the checker window if available.
         */
        if (farm.checkerWindow)
            destroyWindow(farm.checkerWindow);
    });
}