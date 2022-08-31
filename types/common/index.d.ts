/**
 * Statuses for the farms.
 */
type FarmStatus = "farming" | "idle" | "checking" | "disabled" | "attention-required";

/**
 * The settingsfile (`settings.json`) configuration.
 */
type SettingsFile = {
    launchOnStartup: boolean;
    showMainWindowOnLaunch: boolean;
    disable3DModuleAnimation: boolean;
}

/**
 * All game farm properties.
 * Properties from `GameFarmTemplate` class.
 */
type Farm = {
    gameName: string;
    checkerWebsite: string;
    enabled: boolean;
    schedule: number;
    uptime: number;
}

/**
 * The cachefile (`farms_cache.json`) for the files.
 */
type FarmsCacheFile = {
    uptime: number;
    farms: Farm[];
}

/**
 * The object which is given to the `FarmStatus` component.
 */
type FarmRendererObject = {
    gameName: string;
    status: FarmStatus;
}