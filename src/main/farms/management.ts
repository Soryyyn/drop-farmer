import set from "lodash.set";
import { getConfigKey, updateKeyValue } from "../config";
import { log } from "../util/logger";
import { getSettings, loadCachedIntoSettings, updateSettings } from "../util/settings";
import LeagueOfLegends from "./leagueOfLegends";
import OverwatchContenders from "./overwatchContenders";
import OverwatchLeague from "./overwatchLeague";
import FarmTemplate from "./template";

/**
 * All default farms which are added by default.
 */
const DEFAULT_FARMS: FarmTemplate[] = [
    new LeagueOfLegends(),
    new OverwatchLeague(),
    new OverwatchContenders(),
];

/**
 * The currently usable farms.
 */
let currentFarms: FarmTemplate[] = [];

export function initFarms(): void {
    addDefaultFarms();
    addCustomFarms();
    cacheAvailableFarms();

    /**
     * After setting the the config to the cached config, update the settings
     * useable by the app, with the cached settings.
     */
    loadCachedIntoSettings();

    loadSettingsIntoFarms();
    startFarms();

    log("MAIN", "DEBUG", "Initialized farms");
}

/**
 * Add the default farms to the current farms array.
 */
function addDefaultFarms(): void {
    currentFarms.push(...DEFAULT_FARMS);
    log("MAIN", "DEBUG", "Added default farms");
}

/**
 * Add the custom farms found from the config file.
 */
function addCustomFarms(): void {
    let cachedFarms: CachedFarms = getConfigKey("farms");

    /**
     * Find the none default farms in the farms object.
     */
    for (const [key] of Object.entries(cachedFarms)) {
        let foundDefault: boolean = false;
        for (const farm of currentFarms) {
            if (key === farm.getName()) foundDefault = true;
        }

        /**
         * Add the farm if `foundDefault` is set to false.
         */
        if (!foundDefault) {
        }
    }

    log("MAIN", "DEBUG", "Added custom farms");
}

/**
 * Chache all available farms.
 */
function cacheAvailableFarms(): void {
    /**
     * Add the farm settings to the settings.
     * These are only the initial settings.
     */
    currentFarms.forEach((farm) => {
        updateSettings(farm.getName(), createSpecificFarmSettings(farm));
    });

    /**
     * Also manually update the cached farms.
     */
    updateKeyValue("farms", convertFarmsIntoCached());
}

/**
 * Start all farms which are in the current farms array.
 * If they are not enabled, they won't start.
 */
export function startFarms(): void {
    currentFarms.forEach((farm) => {
        farm.start();
    });
    log("MAIN", "DEBUG", "Started enabled farms");
}

/**
 * Returns all current farms.
 */
export function getFarms(): FarmTemplate[] {
    return currentFarms;
}

/**
 * Returns a farm by its name.
 * @param {string} name The name of the farm to retrieve.
 */
export function getFarmByName(name: string): FarmTemplate {
    let foundIndex = 0;
    currentFarms.forEach((farm, index) => {
        if (farm.getName() === name) foundIndex = index;
    });
    return currentFarms[foundIndex];
}

/**
 * Convert the currently in runtime loaded farms into cached objects for writing
 * to the config file.
 */
export function convertFarmsIntoCached(): CachedFarms {
    let converted: CachedFarms = {};

    /**
     * Create a object entry for each farm with the values wanted.
     */
    currentFarms.forEach((farm) => {
        set(converted, farm.getName(), {
            uptime: farm.getCurrentUptime()
        });
    });

    return converted;
}

/**
 * Create the settings for the wanted farm.
 * NOTE: Add wanted settings here.
 *
 * @param {FarmTemplate} farm The farm to create the settings for.
 */
function createSpecificFarmSettings(farm: FarmTemplate): Setting[] {
    return [
        {
            name: "enabled",
            shownName: "Farm enabled",
            description: "Enable or disable this farm.",
            value: farm.isEnabled(),
            defaultValue: false
        },
        {
            name: "checkerWebsite",
            shownName: "Checking website",
            description: "The website drop-farmer checks for the schedule, live matches, etc. to start farming.",
            value: farm.getCheckerWebsite(),
            defaultValue: ""
        },
        {
            name: "checkingSchedule",
            shownName: "Checking schedule",
            description: "The schedule (in minutes) on which drop-farmer will check if farming is possible.",
            value: farm.getCheckingSchedule(),
            defaultValue: 30,
            max: 60,
            min: 1,
        }
    ];
}

/**
 * Convert the farm settings to cached for writing to config.
 */
export function convertFarmSettingsIntoCached(): Setting[] {
    let settings: Setting[] = [];

    /**
     * Load the current setting from each farm into the settings array for caching.
     */
    currentFarms.forEach((farm) => {
        let tempObject: any = {};
        set(tempObject, farm.getName(), createSpecificFarmSettings(farm));

        settings.push(tempObject);
    });

    return settings;
}

/**
 * Load the setting which were loaded previously into the farms.
 */
export function loadSettingsIntoFarms(): void {
    currentFarms.forEach((farm) => {
        /**
         * Initialize all settings data for each farm after the settings have
         * been loaded.
         */
        farm.initializeData();
    });

    log("MAIN", "DEBUG", "Loaded cached data into farmss");
}

/**
 * Get the farm sidebar items to render.
 */
export function getSidebarItems(): SidebarFarmItem[] {
    const sidebarItems: SidebarFarmItem[] = [];

    currentFarms.forEach((farm) => {
        sidebarItems.push(farm.getForSidebar());
    });

    return sidebarItems;
}

/**
 * Destroy all farming windows and checker windows for each farm.
 */
export function destroyAllFarmWindows(): void {
    currentFarms.forEach((farm) => {
        farm.destroyAllFarmingWindows();
        farm.destroyCheckerWindow();
    });

    log("MAIN", "DEBUG", "Destroyed all farm windows");
}

/**
 * Stop all farm cron jobs.
 */
export function stopFarmJobs(): void {
    currentFarms.forEach((farm) => {
        farm.stopAllTasks();
    });
    log("MAIN", "DEBUG", "Stopped all farm jobs");
}