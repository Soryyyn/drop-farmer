/**
 * The channels which the main and renderer process communicate on.
 */
export enum Channels {
    openLinkInExternal = "open-link-in-external",
    getFarms = "get-farms",
    farmStatusChange = "farm-status-change",
    farmWindowsVisibility = "farm-windows-visibility",
    getSettings = "get-settings",
    internetChange = "internet-change",
    log = "log",
    saveNewSettings = "save-new-settings",
    get3DAnimationsDisabled = "get-3D-animations-disabled",
    getApplicationVersion = "get-application-version",
    clearCache = "clear-cache",
    restartScheduler = "restart-scheduler",
    shutdown = "shutdown",
    toastSuccess = "toast-success",
    toastError = "toast-error",
    toastLoading = "toast-loading",
    toastForcedType = "toast-forced-type",
    updateCheck = "update-check",
    updateAvailable = "update-available",
    installUpdate = "install-update",
}