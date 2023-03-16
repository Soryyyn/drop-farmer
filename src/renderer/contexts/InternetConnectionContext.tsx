import { useHandleOneWay } from '@hooks/useHandleOneWay';
import React, { createContext, useState } from 'react';

export const InternetConnectionContext = createContext<boolean>(true);

export function InternetConnectionContextProvider({
    children
}: DefaultContextProps) {
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
