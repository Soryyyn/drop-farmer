type Player = {
    name: string;
    qualityToSet: string;
}

type Farm = {
    id: number;
    name: string;
    enabled: boolean;
    player: string;
    websiteToCheck: string;
    uptime: number; // in minutes
    farmedDropsLifetime: number;
    farmedDropsToday: number;
}

type FarmStatus = "farming" | "idle" | "checking" | "disabled"

type FarmStatusObject = {
    id: number;
    status: FarmStatus;
}

type SettingsFile = {
    headless: boolean;
    launchOnStartup: boolean;
    checkingRate: number;
    players: Player[];
}

type FarmsFile = {
    uptime: number;
    farms: Farm[];
}

type FarmWindow = {
    link: string;
    browserWindow: Electron.BrowserWindow
}

type FarmWindowObject = {
    id: number;
    windows: FarmWindow[]
}

type FarmsCacheFile = {
    uptime: number;
    farms: tempFarm[];
}

type tempFarm = {
    gameName: string;
    checkerWebsite: string;
    enabled: boolean;
    schedule: number;
}

type FarmRendererObject = {
    gameName: string;
    status: FarmStatus;
}