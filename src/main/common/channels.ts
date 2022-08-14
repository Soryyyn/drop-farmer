/**
 * The channels which the main and renderer process communicate on.
 */
export enum Channels {
    openLinkInExternal = "open-link-in-external",
    getFarms = "get-farms",
    farmStatusChange = "farm-status-change",
    farmWindowsVisibility = "farm-windows-visibility",
    getInternetConnection = "get-internet-connection",
    rendererError = "renderer-error",
    getSettings = "get-settings",
}