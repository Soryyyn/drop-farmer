import { getFarmsData, updateFarmsData } from "./config";
import FarmTemplate from "./games/farmTemplate";
import LeagueOfLegends from "./games/leagueOfLegends";
import OverwatchContenders from "./games/overwatchContenders";
import OverwatchLeague from "./games/overwatchLeague";
import { log } from "./logger";

/**
 * All farms.
 */
const FARMS: FarmTemplate[] = [
    new LeagueOfLegends(),
    new OverwatchLeague(),
    new OverwatchContenders(),
];

/**
 * Initialize all farms.
 */
export function initFarms(): void {
    applyDataToFarms();
}

/**
 * Apply the already saved data from the config file to the farm.
 * If no data for the farm is found, write it to the config file.
 */
function applyDataToFarms(): void {
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
            farmsData.push(farm.getFarmData());
            farm.initialize(farmsData[farmsData.length - 1]);
        }
    }

    /**
     * If new data needs to be written.
     */
    if (updateNeeded)
        updateFarmsData(farmsData);
}

/**
 * Save the changes to the config file which the user made from the renderer.
 *
 * @param {FarmSaveData[]} userChanges The changes the user made to the farm.
 */
export function saveUserChanges(userChanges: FarmSaveData[]): void {
    updateFarmsData(userChanges);
    log("MAIN", "INFO", "Saved user made changes to config file")
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

    log("MAIN", "INFO", "Destroyed all windows of farms");
}

/**
 * Get all data of the farms which the renderer needs.
 */
export function getFarmRendererData(): newFarmRendererObject[] {
    let rendererData: newFarmRendererObject[] = [];

    for (const farm of FARMS)
        rendererData.push({
            name: farm.getName(),
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