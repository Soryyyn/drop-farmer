import { app, ipcMain, shell } from "electron";
import { Channels } from "./common/channels";
import { cacheNewUserFarmsSettings, getFarms, getFarmsForRenderer, getFarmsSettings } from "./farms";
import { GameFarmTemplate } from "./games/gameFarmTemplate";
import { checkInternetConnection, getCurrentInternetConnection } from "./internet";
import { log } from "./logger";
import { cacheNewUserSettings, getCurrentSettings } from "./settings";

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param channel IPC channel to listen on.
 * @param listener Callback when event has been received.
 */
function handleOneWay(channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void) {
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 *
 * @param channel IPC channel to listen on.
 * @param listener Callback to execute when event has been received.
 */
function handleAndReply(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
    ipcMain.handle(channel, listener);
}

export function sendOneWay(window: Electron.BrowserWindow, channel: string, ...args: any[]) {
    window.webContents.send(channel, ...args);
}

/**
 * Reacts when a social link or something different is pressed, where it should
 * open a link in a external browser window.
 */
handleOneWay(Channels.openLinkInExternal, (event, link: string) => {
    log("MAIN", "INFO", `Received one-way signal on channel \"${Channels.openLinkInExternal}\"`);
    shell.openExternal(link);
});

/**
 * Reacts when the home site is loaded and the farms need to be displayed.
 * Also sends the status of all farms to handle.
 */
handleAndReply(Channels.getFarms, () => {
    log("MAIN", "INFO", `Received signal with needed reply on channel \"${Channels.getFarms}"`);
    return getFarmsForRenderer();
});

/**
 * React when the eye symbol is pressed on the renderer to hide or show all farm windows.
 */
handleOneWay(Channels.farmWindowsVisibility, (event, value) => {
    log("MAIN", "INFO", `Received one-way signal on channel \"${Channels.farmWindowsVisibility}\"`);
    getFarms().forEach((farm: GameFarmTemplate) => {
        if (farm.gameName === value.farm.gameName) {
            if (value.show) {
                farm.showWindows()
            } else {
                farm.hideWindows()
            }
        }
    });
});

/**
 * React when the current status of the internet connection is wanted.
 */
handleAndReply(Channels.getInternetConnection, async (event) => {
    log("MAIN", "INFO", `Received one-way signal on channel \"${Channels.getInternetConnection}\"`);

    return await checkInternetConnection()
});

/**
 * React to error signals from the renderer process.
 */
handleOneWay(Channels.log, (event, { type, message }) => {
    log("RENDERER", type, message);
});

/**
 * Reacts when the home site is loaded and the farms need to be displayed.
 * Also sends the status of all farms to handle.
 */
handleAndReply(Channels.getSettings, () => {
    log("MAIN", "INFO", `Received signal with needed reply on channel \"${Channels.getSettings}"`);
    return {
        appSettings: getCurrentSettings(),
        farmsSettings: getFarmsSettings()
    }
});

/**
 * Reacts when the save button is pressed on the settings page.
 */
handleOneWay(Channels.saveNewSettings, (event, settingsToSave: {
    appSettings: SettingsFile,
    farmsSettings: Farm[]
}) => {
    log("MAIN", "INFO", `Received signal with needed reply on channel \"${Channels.saveNewSettings}"`);

    cacheNewUserSettings(settingsToSave.appSettings);
    cacheNewUserFarmsSettings(settingsToSave.farmsSettings);
});

/**
 * React when the user wants to know if the 3d-animations are enabled or not.
 */
handleAndReply(Channels.get3DAnimationsDisabled, () => {
    log("MAIN", "INFO", `Received signal with needed reply on channel \"${Channels.get3DAnimationsDisabled}"`);
    return getCurrentSettings().disable3DModuleAnimation;
});

/**
 * Reacts when renderer wants the application version.
 */
handleAndReply(Channels.getApplicationVersion, () => {
    log("MAIN", "INFO", `Received signal with needed reply on channel \"${Channels.getApplicationVersion}"`);
    return app.getVersion();
});