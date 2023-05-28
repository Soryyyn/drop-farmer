import { SignInObject } from '@df-types/auth.types';
import {
    FarmRendererData,
    LoginForFarmObject,
    NewFarm
} from '@df-types/farms.types';
import { MergedSettings } from '@df-types/settings.types';
import {
    addNewFarm,
    applySettingsToFarms,
    deleteFarm,
    getFarmById,
    getFarmsRendererData
} from '@main/farming/management';
import { signIn, signOut } from '@main/util/auth';
import {
    EventChannels,
    IpcChannel,
    IpcChannels,
    Toasts
} from '@main/util/constants';
import { listenForEvent } from '@main/util/events';
import { log } from '@main/util/logging';
import { disconnectPuppeteer } from '@main/util/puppeteer';
import { removeTypeFromText } from '@main/util/strings';
import { sendToast } from '@main/util/toast';
import { app, ipcMain, shell } from 'electron';
import { readFileSync } from 'fs';
import {
    extractMergedSettings,
    getMergedSettings,
    resetSettingsToDefaultValues,
    updateSettings
} from 'src/main/store/settings';
import { setIsQuitting } from './appEvents';
import { checkIfCanUpdate, handleInstallOfUpdate } from './update';
import { getMainWindow } from './windows';

/**
 * Function for handling a one-way signal coming from the renderer process.
 */
export function handleOneWay(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainEvent, ...args: any[]) => void
) {
    ipcMain.on(channel, listener);
}

/**
 * Function for handling a signal coming from the renderer process and return a response.
 */
export function handleAndReply(
    channel: IpcChannel,
    listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
) {
    ipcMain.handle(channel, listener);
}

/**
 * Send a one-way signal to the wanted window.
 */
export function sendOneWay(channel: IpcChannel, ...args: any[]) {
    const window = getMainWindow();
    if (window !== undefined) {
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
    setIsQuitting();
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

                    sendOneWay(
                        IpcChannels.settingsChanged,
                        getMergedSettings()
                    );

                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            })
        });
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

                    sendOneWay(
                        IpcChannels.settingsChanged,
                        getMergedSettings()
                    );

                    resolve(undefined);
                } catch (err) {
                    reject(err);
                }
            })
        });
    }
);

handleOneWay(IpcChannels.addNewFarm, async (event, farm: NewFarm) => {
    sendToast({
        toast: {
            id: Toasts.FarmCreation,
            type: 'promise',
            duration: 4000,
            textOnSuccess: `Successfully created farm ${farm.id}`,
            textOnLoading: `Creating farm ${farm.id}...`,
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

handleOneWay(IpcChannels.updateCheck, () => checkIfCanUpdate());

handleOneWay(IpcChannels.installUpdate, () => handleInstallOfUpdate());

handleOneWay(IpcChannels.signIn, (event, signInObject: SignInObject) =>
    signIn(signInObject)
);

handleOneWay(IpcChannels.signOut, () => signOut());

handleAndReply(IpcChannels.getChangelog, () => {
    return readFileSync('CHANGELOG.md').toString();
});

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

listenForEvent(EventChannels.FarmsChanged, () => {
    sendOneWay(IpcChannels.farmsChanged, getFarmsRendererData());
    sendOneWay(IpcChannels.settingsChanged, getMergedSettings());
});
