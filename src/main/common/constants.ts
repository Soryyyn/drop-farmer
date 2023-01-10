export enum Toasts {
    UpdateChecking = 'update-checking'
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
    toastSuccess = 'toast-success',
    toastError = 'toast-error',
    toastLoading = 'toast-loading',
    toastForcedType = 'toast-forced-type',
    toast = 'toast',
    internet = 'internet',
    installUpdate = 'install-update',
    updateCheck = 'update-check',
    updateStatus = 'update-status',
    farmLogin = 'farm-login'
}

export enum EventChannels {
    PCWentToSleep = 'pc-went-to-sleep',
    PCWokeUp = 'pc-woke-up',
    LoginForFarm = 'login-for-farm'
}

export const Constants = {
    LogFileName: '.log',
    StoreFileName: 'store'
};

export enum Schedules {
    CheckToFarm = 'check-to-farm',
    Update = 'update'
}
