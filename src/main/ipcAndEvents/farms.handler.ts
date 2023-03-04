import { EventChannels, IpcChannels, Toasts } from '@main/common/constants';
import { removeTypeFromText } from '@main/common/string.helper';
import { handleAndReply, handleOneWay, sendOneWay } from '@main/electron/ipc';
import {
    addNewFarm,
    deleteFarm,
    getFarmById,
    getFarmsRendererData
} from '@main/farming/management';
import { listenForEvent } from '@main/util/events';
import { getMergedSettings } from '@main/util/settings';
import { sendToast } from '@main/util/toast';

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
