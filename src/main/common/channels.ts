/**
 * The channels which the main and renderer process communicate on.
 */
export enum Channels {
    openLinkInExternal = "open-link-in-external",
    getFarms = "get-farms",
    farmStatusChange = "farm-status-change",
    farmWindowsVisibility = "farm-windows-visibility",
    getInternetConnection = "get-internet-connection",
    getSettings = "get-settings",
    log = "log",
    saveNewSettings = "save-new-settings",
    get3DAnimationsDisabled = "get-3D-animations-disabled",
}