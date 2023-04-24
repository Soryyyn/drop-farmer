import { ModalContext } from '@contexts/ModalContext';
import { UpdateContext } from '@contexts/UpdateContext';
import {
    faChartSimple,
    faDownload,
    faGear,
    faPowerOff,
    faRotate,
    faTractor
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { Overlays } from '../Overlay/types';
import NavItem from './NavItem';

export default function Navigation() {
    const { updateAvailable, checkForUpdate, installUpdate } =
        useContext(UpdateContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    return (
        <ul className="w-full flex flex-row gap-2 relative justify-center">
            <NavItem
                icon={faTractor}
                label="Farms"
                onClick={() => {}}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            />
            {/* <NavItem
                icon={faChartSimple}
                label="Statistics"
                onClick={() => {}}
                className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
            /> */}
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
