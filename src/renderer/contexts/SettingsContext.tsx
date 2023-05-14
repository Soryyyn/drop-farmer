import {
    MergedSettings,
    PossibleSetting,
    PossibleSettingId,
    SettingValue,
    SettingWithValue
} from '@df-types/settings.types';
import { useHandleOneWay } from '@renderer/hooks/useHandleOneWay';
import { useSendAndWait } from '@renderer/hooks/useSendAndWait';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import React, { createContext, useCallback, useState } from 'react';

export const SettingsContext = createContext<{
    settings: MergedSettings | undefined;
    setNewSettings: (newSettings: MergedSettings) => void;
    resetToDefaultSettings: () => void;
    getSetting: (
        settingOwner: string,
        id: PossibleSettingId
    ) => SettingWithValue | undefined;
    updateSetting: (
        settingOwner: string,
        id: PossibleSettingId,
        value: SettingValue
    ) => void;
}>({
    settings: undefined,
    setNewSettings() {},
    resetToDefaultSettings() {},
    getSetting() {
        return undefined;
    },
    updateSetting: () => {}
});

export function SettingsContextProvider({ children }: DefaultContextProps) {
    const [settings, setSettings] = useState<MergedSettings>();
    const [oldSettings, setOldSettings] = useState<MergedSettings>();

    useSendAndWait({
        channel: window.api.channels.getSettings,
        callback: (err, settings: MergedSettings) => {
            if (!err) {
                setSettings(settings);
                setOldSettings(cloneDeep(settings));
            }
        }
    });

    useHandleOneWay({
        channel: window.api.channels.settingsChanged,
        callback: (event, changedSettings: MergedSettings) => {
            setSettings(changedSettings);
            setOldSettings(cloneDeep(changedSettings));
        }
    });

    /**
     * Function to save new settings in the main process.
     * Only if new changes actually happened.
     */
    const setNewSettings = useCallback(
        (newSettings: MergedSettings) => {
            if (!isEqual(newSettings, oldSettings)) {
                window.api.sendOneWay(
                    window.api.channels.saveNewSettings,
                    newSettings
                );
            }
        },
        [oldSettings]
    );

    /**
     * Reset the settings to the default values.
     */
    const resetToDefaultSettings = useCallback(() => {
        window.api.sendOneWay(
            window.api.channels.resetSettingsToDefault,
            settings
        );
    }, [settings]);

    /**
     * Get a specific setting or the settings of the owner, ex. application.
     */
    const getSetting = useCallback(
        (settingOwner: string, id: PossibleSettingId) => {
            return settings?.[settingOwner].find(
                (setting) => setting.id === id
            )!;
        },
        [settings]
    );

    /**
     * Update a single setting.
     */
    const updateSetting = useCallback(
        (settingOwner: string, id: PossibleSettingId, value: SettingValue) => {
            const copiedSettings = { ...settings };

            const indexToSetNewValue = copiedSettings[settingOwner].findIndex(
                (setting) => setting.id === id
            );

            copiedSettings[settingOwner][indexToSetNewValue].value = value;
            setNewSettings(copiedSettings);
        },
        [setNewSettings, settings]
    );

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setNewSettings,
                resetToDefaultSettings,
                getSetting,
                updateSetting
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
