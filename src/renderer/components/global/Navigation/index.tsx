import {
    faDownload,
    faGear,
    faPowerOff,
    faRotate,
    faTractor
} from '@fortawesome/free-solid-svg-icons';
import { ModalContext } from '@renderer/contexts/ModalContext';
import { UpdateContext } from '@renderer/contexts/UpdateContext';
import clsx from 'clsx';
import React, { useContext, useState } from 'react';
import { Overlays } from '../Overlay/types';
import NavItem from './NavItem';

export default function Navigation() {
    const { updateAvailable, checkForUpdate, installUpdate } =
        useContext(UpdateContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    const [displayingFarms, setDisplayingFarms] = useState(false);

    return (
        <ul className="w-full flex flex-row gap-3 relative justify-center">
            <div className="relative">
                <NavItem
                    icon={faTractor}
                    label="Farms"
                    onClick={() => setDisplayingFarms(true)}
                    className="bg-pepper-300 text-snow-300 hover:bg-pepper-400"
                />

                <p
                    className={clsx(
                        'absolute -top-2 left-0 -translate-y-full mb-2',
                        {
                            hidden: !displayingFarms,
                            block: displayingFarms
                        }
                    )}
                >
                    FARMS HEJRE
                </p>
            </div>
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
