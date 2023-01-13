export enum Toasts {
    UpdateChecking = 'update-checking',
    FarmCreation = 'farm-creation'
}

export enum IpcChannels {
    openLinkInExternal = 'open-link-in-external',
    getFarms = 'get-farms',
    farmStatusChange = 'farm-status-change',
    farmWindowsVisibility = 'farm-windows-visibility',
    getSettings = 'get-settings',
    saveNewSettings = 'save-new-settings',
    getApplicationVersion = 'get-application-version',
    clearCache = 'clear-cache',
    restartScheduler = 'restart-scheduler',
    shutdown = 'shutdown',
    toast = 'toast',
    internet = 'internet',
    installUpdate = 'install-update',
    updateCheck = 'update-check',
    updateStatus = 'update-status',
    farmLogin = 'farm-login',
    addNewFarm = 'add-new-farm',
    farmsChanged = 'farms-changed',
    settingsChanged = 'settings-changed',
    deleteFarm = 'delete-farm'
}

export enum EventChannels {
    PCWentToSleep = 'pc-went-to-sleep',
    PCWokeUp = 'pc-woke-up',
    LoginForFarm = 'login-for-farm'
}

export const Constants = {
    LogFileName: '.log',
    StoreFileName: 'store',
    StatisticsStoreFileName: 'statistics'
};

export enum Schedules {
    CheckToFarm = 'check-to-farm',
    Update = 'update'
}
