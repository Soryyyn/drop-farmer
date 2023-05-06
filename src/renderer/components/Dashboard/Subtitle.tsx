import { Overlays } from '@renderer/components/global/Overlay/types';
import { ModalContext } from '@renderer/contexts/ModalContext';
import { useAppVersion } from '@renderer/hooks/useAppVersion';
import React, { useContext } from 'react';

export default function Subtitle() {
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);
    const appVersion = useAppVersion();

    return (
        <>
            <span className="text-center w-fit self-center text-pepper-200/75 -mt-1 font-medium flex flex-row gap-1 items-center">
                <p className="px-1">v{appVersion}</p>
                <p>-</p>
                <p
                    className="hover:bg-pepper-900/50 rounded px-1 py-0.5 cursor-pointer transition-all"
                    onClick={() => {
                        setCurrentOverlay(Overlays.Changelog);
                        toggleOverlay();
                    }}
                >
                    Changelog
                </p>
            </span>
        </>
    );
}
