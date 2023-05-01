import { MergedSettings, SettingWithValue } from '@df-types/settings.types';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import React, { createContext, useCallback, useState } from 'react';

export const SettingsContext = createContext<{
    settings: MergedSettings | undefined;
    setNewSettings: (newSettings: MergedSettings) => void;
    resetToDefaultSettings: () => void;
    getSetting: (
        settingOwner: string,
        id: string
    ) => SettingWithValue | undefined;
}>({
    settings: undefined,
    setNewSettings() {},
    resetToDefaultSettings() {},
    getSetting() {
        return undefined;
    }
});

export function SettingsContextProvider({ children }: DefaultContextProps) {
    const [settings, setSettings] = useState<MergedSettings>();
    const [oldSettings, setOldSettings] = useState<MergedSettings>();

    useSendAndWait({
        channel: api.channels.getSettings,
        callback: (err, settings: MergedSettings) => {
            if (!err) {
                setSettings(settings);
                setOldSettings(cloneDeep(settings));
            }
        }
    });

    useHandleOneWay({
        channel: api.channels.settingsChanged,
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
                api.sendOneWay(api.channels.saveNewSettings, newSettings);
            }
        },
        [oldSettings]
    );

    /**
     * Reset the settings to the default values.
     */
    const resetToDefaultSettings = useCallback(() => {
        api.sendOneWay(api.channels.resetSettingsToDefault, settings);
    }, [settings]);

    /**
     * Get a specific setting or the settings of the owner, ex. application.
     */
    const getSetting = useCallback(
        (settingOwner: string, id: string) => {
            return settings?.[settingOwner].find(
                (setting) => setting.id === id
            )!;
        },
        [settings]
    );

    return (
        <SettingsContext.Provider
            value={{
                settings,
                setNewSettings,
                resetToDefaultSettings,
                getSetting
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
