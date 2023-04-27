import Changelog from '@components/Changelog';
import Overlay from '@components/global/Overlay';
import { Overlays } from '@components/global/Overlay/types';
import NewFarm from '@components/NewFarm';
import Settings from '@components/Settings';
import { useKeyPress } from '@hooks/useKeyPress';
import React, { createContext, useCallback, useEffect, useState } from 'react';

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

export function ModalContextProvider({ children }: DefaultContextProps) {
    const [currentOverlay, setCurrentOverlay] = useState<Overlays | undefined>(
        undefined
    );
    const [showing, setShowing] = useState<boolean>(false);
    const escape = useKeyPress('Escape');

    const toggleOverlay = useCallback(() => setShowing(!showing), [showing]);

    /**
     * This renders the wanted modal based on, if the current modal matches one
     * in the enum.
     */
    const renderModal = useCallback(() => {
        if (currentOverlay === Overlays.Settings) {
            return <Settings onClose={toggleOverlay} />;
        } else if (currentOverlay === Overlays.NewFarm) {
            return <NewFarm onClose={toggleOverlay} />;
        } else if (currentOverlay === Overlays.Changelog) {
            return <Changelog onClose={toggleOverlay} />;
        }

        return <></>;
    }, [currentOverlay, toggleOverlay]);

    /**
     * Close the modal if its shown and the user tries to close it via escape key.
     */
    useEffect(() => {
        if (escape && showing) toggleOverlay();
    }, [escape, showing, toggleOverlay]);

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
