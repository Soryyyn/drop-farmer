/**
 * The channels which the main and renderer process communicate on.
 */
export enum Channels {
    openLinkInExternal = "open-link-in-external",
    refreshFarms = "refresh-farms",
    updateFarm = "update-farm",
    removeFarm = "remove-farm",
}