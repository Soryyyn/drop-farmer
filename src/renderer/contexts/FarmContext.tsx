import {
    FarmRendererData,
    FarmStatus,
    LoginForFarmObject
} from '@df-types/farms.types';
import { useHandleOneWay } from '@renderer/chooks/useHandleOneWay';
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
        channel: api.channels.farmLogin,
        callback: (event, data: LoginForFarmObject) => {
            if (data.id === farm.id) {
                setLoginNeeded(data.needed);
            }
        }
    });

    function setWindowsVisibility(shouldBeShown: boolean) {
        api.sendOneWay(api.channels.farmWindowsVisibility, {
            ...farm,
            windowsShown: shouldBeShown
        });
    }

    function restartSchedule() {
        api.sendOneWay(api.channels.restartScheduler, farm.id);
    }

    function clearCache() {
        api.sendOneWay(api.channels.clearCache, farm.id);
    }

    function deleteSelf() {
        api.sendOneWay(api.channels.deleteFarm, farm.id);
    }

    function resetConditions() {
        api.sendOneWay(api.channels.resetFarmingConditions, farm.id);
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
