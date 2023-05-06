import { useHandleOneWay } from '@renderer/hooks/useHandleOneWay';
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
        channel: window.api.channels.updateStatus,
        callback: (event, status: boolean) => {
            setUpdateAvailable(status);
        }
    });

    function checkForUpdate() {
        window.api.sendOneWay(window.api.channels.updateCheck);
    }

    function installUpdate() {
        window.api.sendOneWay(window.api.channels.installUpdate);
    }

    return (
        <UpdateContext.Provider
            value={{ updateAvailable, checkForUpdate, installUpdate }}
        >
            {children}
        </UpdateContext.Provider>
    );
}
