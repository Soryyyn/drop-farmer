import Overlay from '@components/global/Overlay';
import Settings from '@components/Settings';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import { cloneDeep, isEqual } from 'lodash';
import React, { createContext, useState } from 'react';
import { Overlays } from './overlays';

interface Props {
    children: JSX.Element | JSX.Element[];
}

/**
 * Contexts
 */
export const SettingsContext = createContext<{
    settings: Settings | undefined;
    setNewSettings: (newSettings: Settings) => void;
    resetToDefaultSettings: () => void;
}>({ settings: undefined, setNewSettings() {}, resetToDefaultSettings() {} });

export const InternetConnectionContext = createContext<boolean>(true);

export const ModalContext = createContext<{
    currentOverlay: Overlays | undefined;
    setCurrentOverlay: (modal: Overlays) => void;
    toggleOverlay: () => void;
}>({
    currentOverlay: undefined,
    setCurrentOverlay: () => {},
    toggleOverlay: () => {}
});

/**
 * Provider components
 */
export function SettingsContextProvider({ children }: Props) {
    const [settings, setSettings] = useState<Settings>();
    const [oldSettings, setOldSettings] = useState<Settings>();

    useSendAndWait(window.api.channels.getSettings, null, (err, settings) => {
        if (err) {
            window.api.log('ERROR', err);
        } else {
            setSettings(settings);
            setOldSettings(cloneDeep(settings));
        }
    });

    /**
     * Function to save new settings in the main process.
     * Only if new changes actually happened.
     */
    function setNewSettings(newSettings: Settings) {
        if (!isEqual(newSettings, oldSettings)) {
            window.api.sendOneWay(
                window.api.channels.saveNewSettings,
                newSettings
            );

            setSettings(newSettings);
            setOldSettings(cloneDeep(newSettings));
        }
    }

    /**
     * Reset the settings to the default values.
     */
    function resetToDefaultSettings() {
        const appliedChanges = cloneDeep(settings!);

        for (const [key, value] of Object.entries(appliedChanges!)) {
            value.forEach((setting, index) => {
                appliedChanges[key][index].value = setting.defaultValue;
            });
        }

        setNewSettings(appliedChanges);
    }

    return (
        <SettingsContext.Provider
            value={{ settings, setNewSettings, resetToDefaultSettings }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function InternetConnectionContextProvider({ children }: Props) {
    const [internetConnectionContext, setInternetConnectContext] =
        useState<boolean>(true);

    useHandleOneWay(
        window.api.channels.internet,
        null,
        (event, internetConnection) => {
            setInternetConnectContext(internetConnection);
        }
    );

    return (
        <InternetConnectionContext.Provider value={internetConnectionContext}>
            {children}
        </InternetConnectionContext.Provider>
    );
}

export function ModalContextProvider({ children }: Props) {
    const [currentOverlay, setCurrentOverlay] = useState<Overlays | undefined>(
        undefined
    );
    const [showing, setShowing] = useState<boolean>(false);

    function toggleOverlay() {
        setShowing(!showing);
    }

    /**
     * This renders the wanted modal based on, if the current modal matches one
     * in the enum.
     */
    function renderModal() {
        if (currentOverlay === Overlays.Settings) {
            return <Settings onClose={toggleOverlay} />;
        }

        return <></>;
    }

    return (
        <ModalContext.Provider
            value={{ currentOverlay, setCurrentOverlay, toggleOverlay }}
        >
            <Overlay showing={showing}>{renderModal()}</Overlay>

            {children}
        </ModalContext.Provider>
    );
}
