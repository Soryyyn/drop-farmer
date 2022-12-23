export enum Toasts {
    UpdateChecking = 'update-checking'
}

export enum IpcChannels {
    openLinkInExternal = 'open-link-in-external',
    getFarms = 'get-farms',
    farmStatusChange = 'farm-status-change',
    farmWindowsVisibility = 'farm-windows-visibility',
    getSettings = 'get-settings',
    log = 'log',
    saveNewSettings = 'save-new-settings',
    get3DAnimationsDisabled = 'get-3D-animations-disabled',
    getApplicationVersion = 'get-application-version',
    clearCache = 'clear-cache',
    restartScheduler = 'restart-scheduler',
    shutdown = 'shutdown',
    toastSuccess = 'toast-success',
    toastError = 'toast-error',
    toastLoading = 'toast-loading',
    toastForcedType = 'toast-forced-type',
    updateAvailable = 'update-available',
    restart = 'restart',
    deleteFarm = 'delete-farm',
    internet = 'internet',
    update = 'update-status',
    installUpdate = 'install-update',
    updateCheck = 'update-check',
    updateStatus = 'update-status'
}

export enum EventChannels {
    PCWentToSleep = 'pc-went-to-sleep',
    PCWokeUp = 'pc-woke-up'
}
