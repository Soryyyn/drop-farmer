import {
    FarmRendererData,
    FarmStatus,
    LoginForFarmObject
} from '@df-types/farms.types';
import { useHandleOneWay } from '@renderer/hooks/useHandleOneWay';
import React, { createContext, useState } from 'react';

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

export function FarmContextProvider({
    children,
    farm
}: DefaultContextProps & {
    farm: FarmRendererData;
}) {
    const [loginNeeded, setLoginNeeded] = useState<boolean>(false);

    useHandleOneWay({
        channel: window.api.channels.farmLogin,
        callback: (event, data: LoginForFarmObject) => {
            if (data.id === farm.id) {
                setLoginNeeded(data.needed);
            }
        }
    });

    function setWindowsVisibility(shouldBeShown: boolean) {
        window.api.sendOneWay(window.api.channels.farmWindowsVisibility, {
            ...farm,
            windowsShown: shouldBeShown
        });
    }

    function restartSchedule() {
        window.api.sendOneWay(window.api.channels.restartScheduler, farm.id);
    }

    function clearCache() {
        window.api.sendOneWay(window.api.channels.clearCache, farm.id);
    }

    function deleteSelf() {
        window.api.sendOneWay(window.api.channels.deleteFarm, farm.id);
    }

    function resetConditions() {
        window.api.sendOneWay(
            window.api.channels.resetFarmingConditions,
            farm.id
        );
    }

    return (
        <FarmContext.Provider
            value={{
                farm,
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
