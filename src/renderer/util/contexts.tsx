import Overlay from '@components/global/Overlay';
import Settings from '@components/Settings';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import { cloneDeep, isEqual } from 'lodash';
import React, { createContext, useEffect, useState } from 'react';
import { Overlays } from './overlays';

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
    setCurrentOverlay: (modal: Overlays | undefined) => void;
}>({ currentOverlay: undefined, setCurrentOverlay: () => {} });

interface Props {
    children: JSX.Element | JSX.Element[];
}

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

            setOldSettings(cloneDeep(newSettings));
        }
    }

    /**
     * Reset the settings to the default values.
     */
    function resetToDefaultSettings() {
        const copy = cloneDeep(settings!);

        for (const [key] of Object.entries(copy)) {
            for (const [setting, settingValues] of Object.entries(copy[key])) {
                settingValues.value = settingValues.defaultValue;
            }
        }

        window.api.sendOneWay(window.api.channels.saveNewSettings, copy);
        setSettings(copy);
        setOldSettings(copy);
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
    const [showingOverlay, setShowingOverlay] = useState<boolean>(false);

    useEffect(() => {
        if (currentOverlay !== undefined) {
            setShowingOverlay(true);
        } else {
            setShowingOverlay(false);
        }
    }, [currentOverlay]);

    /**
     * This renders the wanted modal based on, if the current modal matches one
     * in the enum.
     */
    function renderModal() {
        if (currentOverlay === Overlays.Settings) {
            return <Settings onClose={() => setCurrentOverlay(undefined)} />;
        } else {
            return <></>;
        }
    }

    return (
        <ModalContext.Provider value={{ currentOverlay, setCurrentOverlay }}>
            <Overlay showing={showingOverlay}>{renderModal()}</Overlay>
            {children}
        </ModalContext.Provider>
    );
}
