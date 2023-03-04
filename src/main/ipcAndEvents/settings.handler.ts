import { IpcChannels, Toasts } from '@main/common/constants';
import { handleAndReply, handleOneWay, sendOneWay } from '@main/electron/ipc';
import { applySettingsToFarms } from '@main/farming/management';
import {
    extractMergedSettings,
    getMergedSettings,
    resetSettingsToDefaultValues,
    updateSettings
} from '@main/util/settings';
import { sendToast } from '@main/util/toast';

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
