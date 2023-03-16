import { useHandleOneWay } from '@hooks/useHandleOneWay';
import React, { createContext, useState } from 'react';

export const UpdateContext = createContext<{
    updateAvailable: boolean;
    checkForUpdate: () => void;
    installUpdate: () => void;
}>({
    updateAvailable: false,
    checkForUpdate: () => {},
    installUpdate: () => {}
});

export function UpdateContextProvider({ children }: DefaultContextProps) {
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
