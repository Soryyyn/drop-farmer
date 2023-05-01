import {
    FarmRendererData,
    FarmStatus,
    LoginForFarmObject
} from '@df-types/farms.types';
import { useHandleOneWay } from '@hooks/useHandleOneWay';
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
    farm,
    onStatusUpdate
}: DefaultContextProps & {
    farm: FarmRendererData;
    onStatusUpdate?: (status?: FarmStatus) => void;
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
                onStatusUpdate?.(newFarmStatus.status);
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
