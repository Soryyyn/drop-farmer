import { app, ipcMain, shell } from "electron";
import { Channels } from "../common/channels";
import { getFarmByName, getFarms, getSidebarItems } from "../farms/management";
// import { getApplicationSettings, getFarmsData, updateApplicationSettings, updateFarmsData } from "../config";
// import { deleteFarm, getFarmByName, getFarmRendererData, getFarms } from "../farms/management";
import type FarmTemplate from "../farms/template";
import { log } from "../util/logger";
import {
    getSettings,
    getSpecificSetting,
    updateSettings
} from "../util/settings";
import { sendBasicToast, sendPromiseToast } from "../util/toast";
import { setAppQuitting } from "./windows";

/**
 * Function for handling a one-way signal coming from the renderer process.
 *
 * @param {Channels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback when event has been received.
 */
export function handleOneWay(
    channel: Channels,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    log("MAIN", "DEBUG", `Handling one-way signal on ${channel}`);
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 *
 * @param {Channels} channel IPC channel to listen on.
 * @param {(event: IpcMainEvent, ...args: any[]) => void} listener Callback to execute when event has been received.
 */
export function handleAndReply(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) {
    log("MAIN", "DEBUG", `Handling two-way signal on ${channel}`);
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 *
 * @param {Electron.BrowserWindow} window The window to send the ipc signal too.
 * @param {Channels} channel The ipc channel to send the signal too.
 * @param {...any[]} args The data to send with the signal.
 */
export function sendOneWay(
    window: Electron.BrowserWindow,
    channel: string,
    ...args: any[]
) {
    if (window.webContents != undefined) {
        log("MAIN", "DEBUG", `Sending one-way signal on ${channel}`);
        window.webContents.send(channel, ...args);
    }
}

/**
 * Ipc events below.
 */
handleOneWay(Channels.log, (event, { type, message }) => {
    log("RENDERER", type, message);
});

handleAndReply(Channels.getFarms, () => {
    return getSidebarItems();
});

handleOneWay(Channels.farmWindowsVisibility, (event, { name, showing }) => {
    const farm = getFarmByName(name);
    if (farm != undefined) {
        if (showing) farm.showAllWindows();
        else farm.hideAllWindows();
    }
});

handleOneWay(Channels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

handleOneWay(Channels.shutdown, () => {
    setAppQuitting(true);
    app.quit();
});

handleOneWay(Channels.restart, () => {
    log("MAIN", "INFO", "Restarting application");
    app.relaunch();

    /**
     * We have to quit the app here, because `app.relaunch()` doesn't quit
     * the app automatically.
     */
    setAppQuitting(true);
    app.quit();
});

handleAndReply(Channels.getSettings, () => {
    return getSettings();
});

handleOneWay(Channels.saveNewSettings, (event, settingsToSave: Settings) => {
    sendPromiseToast(
        {
            id: "settings-saving",
            textOnLoading: "Saving settings...",
            textOnSuccess: "Saved settings.",
            textOnError: "Failed saving settings.",
            duration: 4000
        },
        new Promise(async (resolve, reject) => {
            try {
                for (const [key, value] of Object.entries(settingsToSave)) {
                    updateSettings(key, value);
                }
                resolve(undefined);
            } catch (err) {
                reject(err);
            }
        })
    );
});

handleAndReply(Channels.get3DAnimationsDisabled, () => {
    return getSpecificSetting("application", "disable3DModelAnimation").value;
});

handleAndReply(Channels.getApplicationVersion, () => {
    return app.getVersion();
});

handleOneWay(Channels.clearCache, (event, name) => {
    const farm = getFarmByName(name);
    if (farm != undefined) {
        sendBasicToast(
            {
                id: `cleared-cache-${farm.getName()}`,
                textOnSuccess: `Cleared cache for ${farm.getName()}.`,
                textOnError: `Failed clearing cache for ${farm.getName()}}.`,
                duration: 4000
            },
            () => {
                farm.restartScheduler(async () => {
                    await farm.clearFarmCache();
                });

                farm.updateStatus("idle");
            }
        );
    }
});

handleOneWay(Channels.restartScheduler, (event, name) => {
    const farm = getFarmByName(name);
    if (farm != undefined) {
        sendBasicToast(
            {
                id: `restart-schedule-${farm.getName()}`,
                textOnSuccess: `Restarted schedule for ${farm.getName()}.`,
                textOnError: `Failed restarting schedule for ${farm.getName()}}.`,
                duration: 4000
            },
            () => {
                farm.restartScheduler();
                farm.updateStatus("idle");
            }
        );
    }
});
