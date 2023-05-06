import { FarmRendererData, NewFarm } from '@df-types/farms.types';
import { useHandleOneWay } from '@renderer/chooks/useHandleOneWay';
import { useSendAndWait } from '@renderer/chooks/useSendAndWait';
import { useSendOneWay } from '@renderer/chooks/useSendOneWay';
import { sortFarmsByStatus } from '@renderer/util/sort';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export const FarmsContext = createContext<{
    farms: FarmRendererData[];
    sortedByStatus: FarmRendererData[];
    isValid: boolean;
    addFarm: (farm: NewFarm) => void;
    resetValidation: () => void;
}>({
    farms: [],
    sortedByStatus: [],
    isValid: false,
    addFarm: () => {},
    resetValidation: () => {}
});

export function FarmsContextProvider({ children }: DefaultContextProps) {
    const [farms, setFarms] = useState<FarmRendererData[]>([]);
    const [farmAdded, setFarmAdded] = useState<NewFarm>();
    const [isValid, setIsValid] = useState(false);
    const [sortedFarms, setSortedFarms] = useState<FarmRendererData[]>([]);

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

    /**
     * Sort the farms when they change.
     */
    useEffect(() => {
        setSortedFarms(sortFarmsByStatus(farms));
    }, [farms]);

    const addFarm = useCallback((farm: NewFarm) => setFarmAdded(farm), []);

    const resetValidation = useCallback(() => setIsValid(false), []);

    return (
        <FarmsContext.Provider
            value={{
                farms,
                sortedByStatus: sortedFarms,
                isValid,
                addFarm,
                resetValidation
            }}
        >
            {children}
        </FarmsContext.Provider>
    );
}
