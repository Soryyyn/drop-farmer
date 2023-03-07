import Overlay from '@components/global/Overlay';
import { Overlays } from '@components/global/Overlay/types';
import NewFarm from '@components/NewFarm';
import Settings from '@components/Settings';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import { useSendOneWay } from '@hooks/useSendOneWay';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import React, { createContext, useCallback, useState } from 'react';

interface DefaultProps {
    children: JSX.Element | JSX.Element[];
}

/**
 * Contexts
 */
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

export const InternetConnectionContext = createContext<boolean>(true);

export const ModalContext = createContext<{
    isModalShowing: boolean;
    currentOverlay: Overlays | undefined;
    setCurrentOverlay: (modal: Overlays) => void;
    toggleOverlay: () => void;
}>({
    isModalShowing: false,
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
    isValid: boolean;
    addFarm: (farm: NewFarm) => void;
    resetValidation: () => void;
}>({
    farms: [],
    isValid: false,
    addFarm: () => {},
    resetValidation: () => {}
});

export const FarmContext = createContext<{
    farm: FarmRendererData | undefined;
    loginNeeded: boolean;
    setWindowsVisibility: (shouldBeShown: boolean) => void;
    restartSchedule: () => void;
    clearCache: () => void;
    deleteSelf: () => void;
    resetConditions: () => void;
}>({
    farm: undefined,
    loginNeeded: false,
    setWindowsVisibility: () => {},
    restartSchedule: () => {},
    clearCache: () => {},
    deleteSelf: () => {},
    resetConditions: () => {}
});

/**
 * Provider components
 */
export function SettingsContextProvider({ children }: DefaultProps) {
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
    function setNewSettings(newSettings: MergedSettings) {
        if (!isEqual(newSettings, oldSettings)) {
            api.sendOneWay(api.channels.saveNewSettings, newSettings);
        }
    }

    /**
     * Reset the settings to the default values.
     */
    function resetToDefaultSettings() {
        api.sendOneWay(api.channels.resetSettingsToDefault, settings);
    }

    /**
     * Get a specific setting or the settings of the owner, ex. application.
     */
    function getSetting(settingOwner: string, id: string): SettingWithValue {
        return settings?.[settingOwner].find((setting) => setting.id === id)!;
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

    useHandleOneWay({
        channel: api.channels.internet,
        callback: (event, internetConnection) => {
            setInternetConnectContext(internetConnection);
        }
    });

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
        } else if (currentOverlay === Overlays.NewFarm) {
            return <NewFarm onClose={toggleOverlay} />;
        }

        return <></>;
    }, [currentOverlay]);

    return (
        <ModalContext.Provider
            value={{
                isModalShowing: showing,
                currentOverlay,
                setCurrentOverlay,
                toggleOverlay
            }}
        >
            <Overlay showing={showing}>{renderModal()}</Overlay>
            {children}
        </ModalContext.Provider>
    );
}

export function UpdateContextProvider({ children }: DefaultProps) {
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

    useHandleOneWay({
        channel: api.channels.updateStatus,
        callback: (event, status: boolean) => {
            setUpdateAvailable(status);
        }
    });

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
    const [farmAdded, setFarmAdded] = useState<NewFarm>();
    const [isValid, setIsValid] = useState(false);

    useSendAndWait({
        channel: api.channels.getFarms,
        callback: (err, farms: FarmRendererData[]) => {
            if (!err) setFarms(farms);
        }
    });

    useSendOneWay({
        channel: api.channels.addNewFarm,
        args: farmAdded,
        dependency: farmAdded,
        skipFirstRender: true
    });

    useHandleOneWay({
        channel: api.channels.farmsChanged,
        callback: (event, changedFarms: FarmRendererData[]) => {
            setFarms(changedFarms);
        }
    });

    function addFarm(farm: NewFarm): void {
        setFarmAdded(farm);
    }

    function resetValidation() {
        setIsValid(false);
    }

    return (
        <FarmsContext.Provider
            value={{ farms, isValid, addFarm, resetValidation }}
        >
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
    useHandleOneWay({
        channel: api.channels.farmStatusChange,
        callback: (event, newFarmStatus: FarmRendererData) => {
            if (newFarmStatus.id === trackedFarm.id) {
                setTrackedFarm(newFarmStatus);
            }
        }
    });

    useHandleOneWay({
        channel: api.channels.farmLogin,
        callback: (event, data: LoginForFarmObject) => {
            if (data.id === trackedFarm.id) {
                setLoginNeeded(data.needed);
            }
        }
    });

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

    function deleteSelf() {
        api.sendOneWay(api.channels.deleteFarm, trackedFarm.id);
    }

    function resetConditions() {
        api.sendOneWay(api.channels.resetFarmingConditions, trackedFarm.id);
    }

    return (
        <FarmContext.Provider
            value={{
                farm: trackedFarm,
                loginNeeded,
                setWindowsVisibility,
                restartSchedule,
                clearCache,
                deleteSelf,
                resetConditions
            }}
        >
            {children}
        </FarmContext.Provider>
    );
}
