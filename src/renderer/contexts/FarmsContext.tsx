import { useHandleOneWay } from '@hooks/useHandleOneWay';
import { useSendAndWait } from '@hooks/useSendAndWait';
import { useSendOneWay } from '@hooks/useSendOneWay';
import React, { createContext, useState } from 'react';

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

export function FarmsContextProvider({ children }: DefaultContextProps) {
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