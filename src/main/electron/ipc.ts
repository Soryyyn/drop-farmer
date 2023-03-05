import {
    EventChannels,
    IpcChannel,
    IpcChannels,
    Toasts
} from '@main/common/constants';
import { removeTypeFromText } from '@main/common/string.helper';
import {
    addNewFarm,
    applySettingsToFarms,
    deleteFarm,
    getFarmById,
    getFarms,
    getFarmsRendererData,
    stopFarms
} from '@main/farming/management';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import { connectToElectron, disconnectPuppeteer } from '@main/util/puppeteer';
import {
    extractMergedSettings,
    getMergedSettings,
    resetSettingsToDefaultValues,
    updateSettings
} from '@main/util/settings';
import { sendToast } from '@main/util/toast';
import { app, ipcMain, shell } from 'electron';
import { getMainWindow, setAppQuitting } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
 */
export function handleOneWay(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    log('info', `Handling one-way signal on ${channel}`);
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 */
export function handleAndReply(
    channel: string,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) {
    log('info', `Handling two-way signal on ${channel}`);
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 */
export function sendOneWay(channel: string, ...args: any[]) {
    const window = getMainWindow();
    if (window !== undefined && window.webContents !== undefined) {
        log('info', `Sending one-way signal on ${channel}`);
        window.webContents.send(channel, ...args);
    }
}

/**
 * IPC EVENTS.
 */
handleOneWay(IpcChannels.openLinkInExternal, (event, link: string) => {
    shell.openExternal(link);
});

handleOneWay(IpcChannels.shutdown, () => {
    setAppQuitting(true);
    app.quit();
});

handleAndReply(IpcChannels.getApplicationVersion, () => {
    return app.getVersion();
});

handleAndReply(IpcChannels.getSettings, () => {
    return getMergedSettings();
});

handleOneWay(
    IpcChannels.saveNewSettings,
    (event, settingsToSave: MergedSettings) => {
        sendToast({
            toast: {
                type: 'promise',
                id: Toasts.SettingsSaving,
                textOnLoading: 'Saving settings...',
                textOnSuccess: 'Saved settings.',
                textOnError: 'Failed saving settings.',
                duration: 4000
            },
            promise: new Promise(async (resolve, reject) => {
                try {
                    updateSettings(extractMergedSettings(settingsToSave));
                    applySettingsToFarms();
                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            })
        });

        /**
         * Notify renderer of settings changed.
         */
        sendOneWay(IpcChannels.settingsChanged, getMergedSettings());
    }
);

handleOneWay(
    IpcChannels.resetSettingsToDefault,
    (event, currentSettings: MergedSettings) => {
        sendToast({
            toast: {
                type: 'promise',
                id: Toasts.SettingsReset,
                textOnLoading: 'Resetting settings to default values...',
                textOnSuccess: 'Reset settings.',
                textOnError: 'Failed to reset settings.',
                duration: 4000
            },
            promise: new Promise(async (resolve, reject) => {
                try {
                    updateSettings(
                        extractMergedSettings(
                            resetSettingsToDefaultValues(currentSettings)
                        )
                    );
                    applySettingsToFarms();
                    resetSettingsToDefaultValues(currentSettings);
                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            })
        });

        /**
         * Notify renderer of settings changed.
         */
        sendOneWay(IpcChannels.settingsChanged, getMergedSettings());
    }
);

handleOneWay(IpcChannels.addNewFarm, async (event, farm: NewFarm) => {
    sendToast({
        toast: {
            id: Toasts.FarmCreation,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Successfully created farm ${removeTypeFromText(
                farm.id
            )}`,
            textOnLoading: `Creating farm ${removeTypeFromText(farm.id)}...`,
            textOnError: `Failed creating farm`
        },
        promise: addNewFarm(farm)
    });
});

handleOneWay(IpcChannels.deleteFarm, (event, id) => {
    sendToast({
        toast: {
            id: Toasts.FarmDeletion,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Successfully deleted farm ${removeTypeFromText(
                id
            )}`,
            textOnLoading: `Deleting farm ${removeTypeFromText(id)}...`,
            textOnError: `Failed deleting farm`
        },
        promise: deleteFarm(id)
    });
});

handleOneWay(IpcChannels.resetFarmingConditions, async (event, id) => {
    const farm = getFarmById(id);

    sendToast({
        toast: {
            id: Toasts.FarmResetConditions,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Reset farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}`,
            textOnError: `Failed resetting farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}`,
            textOnLoading: `Resetting farming conditions for farm ${removeTypeFromText(
                farm?.id!
            )}...`
        },
        promise: new Promise(async (resolve, reject) => {
            try {
                await farm?.restartScheduler();
                farm?.resetConditions();

                resolve(undefined);
            } catch (error) {
                reject(error);
            }
        })
    });
});

handleAndReply(IpcChannels.getFarms, () => {
    return getFarmsRendererData();
});

handleOneWay(IpcChannels.clearCache, (event, id) => {
    const farm = getFarmById(id);
    if (farm != undefined) {
        sendToast({
            toast: {
                type: 'basic',
                id: `cleared-cache-${farm.id}`,
                textOnSuccess: `Cleared cache for ${removeTypeFromText(
                    farm.id
                )}.`,
                textOnError: `Failed clearing cache for ${removeTypeFromText(
                    farm.id
                )}}.`,
                duration: 4000
            },
            callback: async () => {
                await farm.restartScheduler(undefined, async () => {
                    await farm.clearCache();
                });
            }
        });
    }
});

handleOneWay(IpcChannels.restartScheduler, (event, name) => {
    const farm = getFarmById(name);
    if (farm != undefined) {
        sendToast({
            toast: {
                type: 'basic',
                id: `restart-schedule-${farm.id}`,
                textOnSuccess: `Restarted schedule for ${removeTypeFromText(
                    farm.id
                )}.`,
                textOnError: `Failed restarting schedule for ${removeTypeFromText(
                    farm.id
                )}}.`,
                duration: 4000
            },
            callback: async () => {
                await farm.restartScheduler();
            }
        });
    }
});

handleOneWay(
    IpcChannels.farmWindowsVisibility,
    (event, updated: FarmRendererData) => {
        const farm = getFarmById(updated.id);
        farm?.toggleWindowsVisibility();
    }
);

/**
 * INTERNAL EVENTS.
 */
listenForEvent(EventChannels.PCWentToSleep, async () => {
    log('warn', 'Disconnecting puppeteer connection');

    disconnectPuppeteer();
});

listenForEvent(EventChannels.LoginForFarm, (event: LoginForFarmObject[]) => {
    sendOneWay(IpcChannels.farmLogin, {
        id: event[0].id,
        needed: event[0].needed
    });
});

/**
 * Once farms changed notify renderer about new settings and farms.
 */
listenForEvent(EventChannels.FarmsChanged, () => {
    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getMergedSettings());
});

listenForEvent(EventChannels.PCWentToSleep, async () => {
    log('warn', 'Stopping farms (if possible)');

    await stopFarms();
});

listenForEvent(EventChannels.PCWokeUp, async () => {
    log('warn', 'Restarting app for wakeup');

    await stopFarms();

    setAppQuitting(true);
    app.relaunch();
    app.exit();
});
