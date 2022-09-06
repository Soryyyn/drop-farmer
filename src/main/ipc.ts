import { app, ipcMain, shell } from "electron";
import { Channels } from "./common/channels";
import { getApplicationSettings, getFarmsData, updateApplicationSettings, updateFarmsData } from "./config";
import { getFarmRendererData, getFarms } from "./farmsManagement";
import FarmTemplate from "./games/farmTemplate";
import { checkInternetConnection } from "./internet";
import { log } from "./logger";
import { setAppQuitting } from "./windows";

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param {Channels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback when event has been received.
 */
export function handleOneWay(channel: Channels, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void) {
    log("MAIN", "INFO", `Handling one-way signal on ${channel}`);
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 *
 * @param {Channels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback to execute when event has been received.
 */
export function handleAndReply(channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) {
    log("MAIN", "INFO", `Handling two-way signal on ${channel}`);
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to send the ipc signal too.
 * @param {Channels} channel The ipc channel to send the signal too.
 * @param {...any[]} args The data to send with the signal.
 */
export function sendOneWay(window: Electron.BrowserWindow, channel: string, ...args: any[]) {
    log("MAIN", "INFO", `Sending one-way signal on ${channel}`);
    window.webContents.send(channel, ...args);
}

handleOneWay(Channels.log, (event, { type, message }) => {
    log("RENDERER", type, message);
});

handleAndReply(Channels.getFarms, () => {
    return getFarmRendererData();
});

handleOneWay(Channels.farmWindowsVisibility, (event, { name, showing }) => {
    for (const farm of getFarms())
        if (farm.getName() === name) {
            if (showing) {
                farm.showAllWindows();
            } else {
                farm.hideAllWindows();
            }
        }
});

handleOneWay(Channels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

handleOneWay(Channels.shutdown, () => {
    setAppQuitting(true);
    app.quit();
});

handleAndReply(Channels.getSettings, () => {
    return {
        applicationSettings: getApplicationSettings(),
        farmSettings: getFarmsData(),
    }
});

handleOneWay(Channels.saveNewSettings, (event, settingsToSave: {
    applicationSettings: ApplicationSettings,
    farmSettings: FarmSaveData[]
}) => {
    updateApplicationSettings(settingsToSave.applicationSettings);
    updateFarmsData(settingsToSave.farmSettings);
});

handleAndReply(Channels.get3DAnimationsDisabled, () => {
    return getApplicationSettings().disable3DModuleAnimation;
});

handleAndReply(Channels.getApplicationVersion, () => {
    return app.getVersion();
});

handleAndReply(Channels.getInternetConnection, async (event) => {
    return await checkInternetConnection()
});

handleOneWay(Channels.clearCache, (event, name) => {
    getFarms().forEach((farm: FarmTemplate) => {
        if (farm.getName() === name) {
            farm.clearFarmCache();

            farm.restartScheduler(() => {
                farm.destroyCheckerWindow();
                farm.destroyAllFarmingWindows();
            });

            farm.updateStatus("idle");
        }
    });
});

handleOneWay(Channels.restartScheduler, (event, name) => {
    getFarms().forEach((farm: FarmTemplate) => {
        if (farm.getName() === name) {
            farm.restartScheduler(() => {
                farm.destroyCheckerWindow();
                farm.destroyAllFarmingWindows();
            });

            farm.updateStatus("idle");
        }
    });
});
