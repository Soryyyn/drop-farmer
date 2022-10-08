import { getFarmsData, updateFarmsData } from "../config";
import { log } from "../util/logger";
import LeagueOfLegends from "./leagueOfLegends";
import OverwatchContenders from "./overwatchContenders";
import OverwatchLeague from "./overwatchLeague";
import FarmTemplate from "./template";
import TwitchStreamer from "./twitchStreamer";

/**
 * The farms array.
 * Gets initialized with the default pre-configured farms.
 */
const FARMS: FarmTemplate[] = [
    new LeagueOfLegends(),
    new OverwatchLeague(),
    new OverwatchContenders(),
];

/**
 * Init function.
 *
 * Adds custom farms from the config file to the `FARMS` array.
 * Loads the data from the config file into the farm.
 *
 * NOTE: Before the `addCustomFarmsFromConfig` function is executed,
 * only the default farms are set in the array.
 */
export function initFarms(): void {
    addCustomFarmsFromConfig();
    loadSavedDataFromConfig();

    log("MAIN", "DEBUG", "Initialized farms");
}

/**
 * Add the found custom farms from the config to the farm array.
 * NOTE: Currently only twitch farms. May change in the future.
 */
function addCustomFarmsFromConfig(): void {
    let added: number = 0;
    for (const farm of getFarmsData()) {
        if (farm.type == "custom") {
            FARMS.push(new TwitchStreamer(farm.name, farm.checkerWebsite));
            added++;
        }
    }

    if (added > 0)
        log("MAIN", "DEBUG", `Added ${added} custom farms to the farms array`);
}

/**
 * Apply the already saved data from the config file to the farm.
 * If no data for the farm is found, write it to the config file.
 */
function loadSavedDataFromConfig(): void {
    let farmsData: FarmSaveData[] = getFarmsData();

    /**
     * If no farms are in the config file, add them with default values.
     * Else initialize the data.
     */
    let updateNeeded: boolean = false;

    for (const farm of FARMS) {
        let found: boolean = false;

        /**
         * Initialize if farm data is found in config.
         */
        for (const farmData of farmsData) {
            if (farm.getName() === farmData.name) {
                found = true;
                farm.initialize(farmData);
            }
        }

        /**
         * If not found, get data from farm and initialize.
         */
        if (!found) {
            updateNeeded = true;
            farmsData.push(farm.getSaveData());
            farm.initialize(farmsData[farmsData.length - 1]);
        }
    }

    /**
     * If new data needs to be written.
     */
    if (updateNeeded)
        updateFarmsData(farmsData, false);

    log("MAIN", "DEBUG", "Loaded saved data");
}

/**
 * Destroy all windows of the farm (checker and farming windows).
 */
export function destroyAllFarmWindows(): void {
    for (const farm of FARMS) {
        if (farm.getCheckerWindow() != undefined)
            farm.destroyCheckerWindow();
        for (const farmingWindow of farm.getFarmingWindows())
            farm.removeFarmingWindowFromArray(farmingWindow);
    }

    log("MAIN", "DEBUG", "Destroyed all windows of farms");
}

/**
 * Get all data of the farms which the renderer needs.
 */
export function getFarmRendererData(): FarmRendererObject[] {
    let rendererData: FarmRendererObject[] = [];

    for (const farm of FARMS)
        rendererData.push({
            name: farm.getName(),
            type: farm.getType(),
            status: farm.getCurrentStatus()
        });

    return rendererData;
}

/**
 * Get farms.
 */
export function getFarms(): FarmTemplate[] {
    return FARMS;
}

/**
 * Stop all farm cron jobs.
 */
export function stopFarmCronJobs(): void {
    for (const farm of FARMS)
        farm.stopScheduler();

    log("MAIN", "INFO", "Stopped all farm cron jobs");
}

/**
 * Get a farm by name. May return undefined if no such farm is found
 * @param {string} name The name of the farm to get.
 */
export function getFarmByName(name: string): FarmTemplate | undefined {
    let found: FarmTemplate | undefined = undefined;

    FARMS.forEach((farm: FarmTemplate) => {
        if (farm.getName() === name) {
            found = farm;
        }
    });

    return found;
}

/**
 * Delete the farm from the current runtime and the config file.
 * @param {FarmTemplate | number} farm The farm to delete.
 */
export async function deleteFarm(farm: FarmTemplate): Promise<void> {
    /**
     * Stop the cron jobs of the farm.
     */
    farm.stopScheduler();

    /**
     * Splice the farm from the runtime.
     */
    FARMS.splice(FARMS.indexOf(farm), 1);

    /**
     * Remove farm from the config file.
     */
    let temp = getFarmsData();
    for (let i = 0; i < temp.length; i++) {
        if (temp[i].name === farm.getName()) {
            temp.splice(i, 1);
        }
    }

    /**
     * Do a force write of the config file.
     */
    await updateFarmsData(temp, true);

    log("MAIN", "DEBUG", `${farm.getName()}: deleted farm`);
}