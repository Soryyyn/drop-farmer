import {
    faDownload,
    faGear,
    faPowerOff,
    faRotate
} from '@fortawesome/free-solid-svg-icons';
import NavItem from '@renderer/components/global/Navigation/NavItem';
import { Overlays } from '@renderer/components/global/Overlay/types';
import { ModalContext } from '@renderer/contexts/ModalContext';
import { UpdateContext } from '@renderer/contexts/UpdateContext';
import React, { useContext } from 'react';
import FarmsListing from './FarmsListing';

export default function Navigation() {
    const { updateAvailable, checkForUpdate, installUpdate } =
        useContext(UpdateContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    return (
        <ul className="w-full flex flex-row gap-2 relative justify-center">
            <FarmsListing />
            <NavItem
                icon={faGear}
                label="Settings"
                onClick={() => {
                    setCurrentOverlay(Overlays.Settings);
                    toggleOverlay();
                }}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />
            <NavItem
                icon={updateAvailable ? faDownload : faRotate}
                label={updateAvailable ? 'Install update' : 'Check for update'}
                withBadge={updateAvailable}
                onClick={updateAvailable ? installUpdate : checkForUpdate}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />
            <NavItem
                icon={faPowerOff}
                label="Quit"
                className="bg-pepper-300 text-snow-300 hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200"
                onClick={() => api.sendOneWay(api.channels.shutdown)}
            />
        </ul>
    );
}
