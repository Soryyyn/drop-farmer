import {
    SettingId,
    SettingUnion,
    SettingsObject
} from '@df-types/settings.types';
import { useHandleOneWay } from '@renderer/hooks/useHandleOneWay';
import { useSendAndWait } from '@renderer/hooks/useSendAndWait';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { createContext, useCallback, useContext, useState } from 'react';

type SettingsContextProps = {
    settings: SettingsObject;
    updateSettings: (newSettings: SettingsObject) => void;
    reset: () => void;
    getSetting: (owner: string, id: SettingId) => SettingUnion;
};

const SettingsContext = createContext<SettingsContextProps | undefined>(
    undefined
);

export function SettingsContextProvider({ children }: DefaultContextProps) {
    const [settings, setSettings] = useState<SettingsObject | undefined>();
    const [oldSettings, setOldSettings] = useState<
        SettingsObject | undefined
    >();

    /**
     * Hydrate the settings on renderer init.
     */
    useSendAndWait({
        channel: window.api.channels.getSettings,
        callback(err, response: SettingsObject) {
            if (!err) {
                setSettings(response);
                setOldSettings(cloneDeep(response));
            }
        }
    });

    /**
     * React to changes from the main process.
     */
    useHandleOneWay({
        channel: window.api.channels.settingsChanged,
        callback(_, response: SettingsObject) {
            setSettings(response);
            setOldSettings(cloneDeep(response));
        }
    });

    /**
     * Update the whole settings if they have changed.
     */
    const updateSettings = useCallback(
        (newSettings: SettingsObject) => {
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
     * Reset the settings to the default.
     */
    const reset = useCallback(
        () => window.api.sendOneWay(window.api.channels.resetSettingsToDefault),
        []
    );

    /**
     * Get a setting from a owner.
     */
    const getSetting = useCallback(
        (owner: string, id: SettingId) =>
            Object.values(settings!)
                .find((object) => object.name === owner)!
                .settings.find((setting) => setting.id === id)!,
        [settings]
    );

    return (
        <SettingsContext.Provider
            value={{ settings: settings!, updateSettings, reset, getSetting }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);

    if (context === undefined) {
        throw new Error(
            'useSettings needs to be inside a SettingsContextProvider'
        );
    }

    return context;
}
