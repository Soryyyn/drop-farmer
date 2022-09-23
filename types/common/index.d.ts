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
    debugLogs: boolean;
}

type ConfigFile = {
    applicationSettings: ApplicationSettings;
    farms: FarmSaveData[];
}

type BasicToast = {
    id: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
}

type PromiseToast = {
    id: string;
    textOnLoading: string;
    textOnSuccess: string;
    textOnError: string;
    duration: number;
}

type ForcedTypeToast = {
    id: string;
    type: "success" | "error";
    text: string;
    duration: number;
}

type ToastFromMain = {
    id: string;
    text: string;
    duration: number;
    type?: "success" | "error";
}