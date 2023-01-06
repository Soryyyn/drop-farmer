import Overlay from '@components/global/Overlay';
import { Overlays } from '@components/global/Overlay/types';
import Settings from '@components/Settings';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import { cloneDeep, isEqual } from 'lodash';
import React, { createContext, useCallback, useState } from 'react';

interface DefaultProps {
    children: JSX.Element | JSX.Element[];
}

/**
 * Contexts
 */
export const SettingsContext = createContext<{
    settings: SettingsSchema | undefined;
    setNewSettings: (newSettings: SettingsSchema) => void;
    resetToDefaultSettings: () => void;
    getSetting: (settingOwner: string, id: string) => Setting | undefined;
}>({
    settings: undefined,
    setNewSettings() {},
    resetToDefaultSettings() {},
    getSetting() {
        return undefined;
    }
});

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

export const UpdateContext = createContext<{
    updateAvailable: boolean;
    checkForUpdate: () => void;
    installUpdate: () => void;
}>({
    updateAvailable: false,
    checkForUpdate: () => {},
    installUpdate: () => {}
});

export const FarmsContext = createContext<{
    farms: FarmRendererData[];
}>({
    farms: []
});

export const FarmContext = createContext<{
    farm: FarmRendererData | undefined;
    loginNeeded: boolean;
    setWindowsVisibility: (shouldBeShown: boolean) => void;
    restartSchedule: () => void;
    clearCache: () => void;
}>({
    farm: undefined,
    loginNeeded: false,
    setWindowsVisibility: () => {},
    restartSchedule: () => {},
    clearCache: () => {}
});

/**
 * Provider components
 */
export function SettingsContextProvider({ children }: DefaultProps) {
    const [settings, setSettings] = useState<SettingsSchema>();
    const [oldSettings, setOldSettings] = useState<SettingsSchema>();

    useSendAndWait(
        api.channels.getSettings,
        null,
        (err, settings: SettingsSchema) => {
            if (err) {
                api.log('ERROR', err);
            } else {
                setSettings(settings);
                setOldSettings(cloneDeep(settings));
            }
        }
    );

    /**
     * Function to save new settings in the main process.
     * Only if new changes actually happened.
     */
    function setNewSettings(newSettings: SettingsSchema) {
        if (!isEqual(newSettings, oldSettings)) {
            api.sendOneWay(api.channels.saveNewSettings, newSettings);

            setSettings(newSettings);
            setOldSettings(cloneDeep(newSettings));
        }
    }

    /**
     * Reset the settings to the default values.
     */
    function resetToDefaultSettings() {
        const appliedChanges = cloneDeep(settings!);

        for (const [key, value] of Object.entries(appliedChanges!.settings)) {
            value.forEach((setting, index) => {
                appliedChanges.settings[key][index].value = setting.default;
            });
        }

        setNewSettings(appliedChanges);
    }

    /**
     * Get a specific setting or the settings of the owner, ex. application.
     */
    function getSetting(settingOwner: string, id: string) {
        return settings?.settings[settingOwner].find(
            (setting) => setting.id === id
        );
    }

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

export function InternetConnectionContextProvider({ children }: DefaultProps) {
    const [internetConnectionContext, setInternetConnectContext] =
        useState<boolean>(true);

    useHandleOneWay(
        api.channels.internet,
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

export function ModalContextProvider({ children }: DefaultProps) {
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
    const renderModal = useCallback(() => {
        if (currentOverlay === Overlays.Settings) {
            return <Settings onClose={toggleOverlay} />;
        }

        return <></>;
    }, [currentOverlay]);

    return (
        <ModalContext.Provider
            value={{ currentOverlay, setCurrentOverlay, toggleOverlay }}
        >
            <Overlay showing={showing}>{renderModal()}</Overlay>
            {children}
        </ModalContext.Provider>
    );
}

export function UpdateContextProvider({ children }: DefaultProps) {
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

    useHandleOneWay(
        api.channels.updateStatus,
        null,
        (event, status: boolean) => {
            setUpdateAvailable(status);
        }
    );

    function checkForUpdate() {
        api.sendOneWay(api.channels.updateCheck);
    }

    function installUpdate() {
        api.sendOneWay(api.channels.installUpdate);
    }

    return (
        <UpdateContext.Provider
            value={{ updateAvailable, checkForUpdate, installUpdate }}
        >
            {children}
        </UpdateContext.Provider>
    );
}

export function FarmsContextProvider({ children }: DefaultProps) {
    const [farms, setFarms] = useState<FarmRendererData[]>([]);

    useSendAndWait(
        api.channels.getFarms,
        null,
        (err, response: FarmRendererData[]) => {
            if (!err) setFarms(response);
        }
    );

    return (
        <FarmsContext.Provider value={{ farms }}>
            {children}
        </FarmsContext.Provider>
    );
}

export function FarmContextProvider({
    children,
    farm
}: DefaultProps & {
    farm: FarmRendererData;
}) {
    const [trackedFarm, setTrackedFarm] = useState<FarmRendererData>(farm);
    const [loginNeeded, setLoginNeeded] = useState<boolean>(false);

    /**
     * Update the status if the status update is the tracked farm.
     */
    useHandleOneWay(
        api.channels.farmStatusChange,
        null,
        (event, newFarmStatus: FarmRendererData) => {
            if (newFarmStatus.id === trackedFarm.id) {
                setTrackedFarm(newFarmStatus);
            }
        }
    );

    useHandleOneWay(
        api.channels.farmLogin,
        null,
        (event, data: LoginForFarmObject) => {
            if (data.id === trackedFarm.id) {
                setLoginNeeded(data.needed);
            }
        }
    );

    function setWindowsVisibility(shouldBeShown: boolean) {
        api.sendOneWay(api.channels.farmWindowsVisibility, {
            ...trackedFarm,
            windowsShown: shouldBeShown
        });
    }

    function restartSchedule() {
        api.sendOneWay(api.channels.restartScheduler, trackedFarm.id);
    }

    function clearCache() {
        api.sendOneWay(api.channels.clearCache, trackedFarm.id);
    }

    return (
        <FarmContext.Provider
            value={{
                farm: trackedFarm,
                loginNeeded,
                setWindowsVisibility,
                restartSchedule,
                clearCache
            }}
        >
            {children}
        </FarmContext.Provider>
    );
}
