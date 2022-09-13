type FarmStatus = "farming" | "idle" | "checking" | "disabled" | "attention-required";

type FarmingWindowObject = {
    window: Electron.BrowserWindow;
    createdAt: number;
}

type FarmSaveData = {
    enabled: boolean;
    name: string;
    checkerWebsite: string;
    checkingSchedule: number;
    uptime: number;
}

type newFarmRendererObject = {
    name: string;
    status: FarmStatus;
}

type FarmSettings = {
    name: string;
    enabled: boolean;
    checkerWebsite: string;
    checkingSchedule: number;
}

type ApplicationSettings = {
    launchOnStartup: boolean;
    showMainWindowOnLaunch: boolean;
    disable3DModuleAnimation: boolean;
}

type ConfigFile = {
    applicationSettings: ApplicationSettings;
    farms: FarmSaveData[];
}