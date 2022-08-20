import { createFile, readFile, writeToFile } from "./fileHandling";
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
 * The app uptime calculated from all farms.
 */
let appUptime: number = 0;

/**
 * Initizalize all farms and create the cache file for the farms to use if it
 * doesn't exist already.
 *
 * Go through each farm and start the schedule to farm.
 */
export function initFarms(): void {
    createCacheFile();
    readCacheFile();

    for (const farm of FARMS) {
        farm.scheduleCheckingFarm();
    }
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
            cache.farms.push(farm.getCacheData());
        });

        createFile(CACHE_FILE_NAME, JSON.stringify(cache, null, 4));
    } catch (err) {
        log("MAIN", "FATAL", `Failed creating farms cache file. Drop-farmer will only use the default configurations without the cache file and wont track progress. Error message:\n\t"${err}"`);
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

        /**
         * Set app uptime;
         */
        appUptime = cacheData.uptime;
    } catch (err) {
        log("MAIN", "ERROR", `Failed reading farms cache file. Error message:\n\t"${err}"`);
    }
}

/**
 * Save all farm data to the cache file.
 */
export function saveDataToCache(): void {
    try {
        let cacheData: FarmsCacheFile = JSON.parse(readFile(CACHE_FILE_NAME));

        /**
         * Go through each farm and get the new cache data.
         */
        for (const farm of getFarms()) {
            /**
             * Stop the timer and save it to the uptime.
             */
            farm.uptime += farm.timer.ms();
            farm.timer.stop();

            /**
             * Set the cache data if they are the same farm.
             */
            for (let i = 0; i < cacheData.farms.length; i++) {
                if (farm.gameName === cacheData.farms[i].gameName) {
                    let tempUptime = cacheData.farms[i].uptime;
                    cacheData.farms[i] = farm.getCacheData();
                    cacheData.uptime += cacheData.farms[i].uptime;
                    cacheData.farms[i].uptime += tempUptime;
                }
            }
        }

        /**
         * Write the new cache.
         */
        writeToFile(CACHE_FILE_NAME, JSON.stringify(cacheData, null, 4), "w");
    } catch (err) {
        log("MAIN", "ERROR", `Failed writing new cache data to file. Error message:\n\t"${err}"`);
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
    log("MAIN", "INFO", "Destroying all windows");
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

/**
 * Go through each farm and get the settings for the renderer process.
 */
export function getFarmsSettings(): Farm[] {
    const farmsSettings: Farm[] = [];

    for (const farm of FARMS) {
        farmsSettings.push({
            gameName: farm.gameName,
            checkerWebsite: farm.checkerWebsite,
            enabled: farm.getEnabled(),
            schedule: farm.schedule,
            uptime: farm.uptime,
        });
    }

    return farmsSettings;
}