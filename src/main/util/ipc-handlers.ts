import { SignInObject } from '@df-types/auth.types';
import { setIsQuitting } from '@main/electron/appEvents';
import { handleAndReply, handleOneWay } from '@main/electron/newipc';
import { checkIfCanUpdate, handleInstallOfUpdate } from '@main/electron/update';
import { getSettings } from '@main/store/settings';
import { app, shell } from 'electron';
import { readFileSync } from 'fs';
import { signIn, signOut } from './auth';
import { IpcChannels } from './constants';

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
    return getSettings();
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
