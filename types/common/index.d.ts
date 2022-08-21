type Player = {
    name: string;
    qualityToSet: string;
}

type FarmStatus = "farming" | "idle" | "checking" | "disabled"

type SettingsFile = {
    launchOnStartup: boolean;
}

type Farm = {
    gameName: string;
    checkerWebsite: string;
    enabled: boolean;
    schedule: number;
    uptime: number;
}

type FarmsCacheFile = {
    uptime: number;
    farms: Farm[];
}

type FarmRendererObject = {
    gameName: string;
    status: FarmStatus;
}