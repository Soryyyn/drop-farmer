type Player = {
    name: string;
    qualityToSet: string;
}

type Farm = {
    id: number;
    name: string;
    enabled: boolean;
    player: Player;
    websiteToCheck: string;
    uptime: number; // in minutes
    farmedDropsLifetime: number;
    farmedDropsToday: number;
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