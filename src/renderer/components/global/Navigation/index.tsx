import { ModalContext } from '@contexts/ModalContext';
import { UpdateContext } from '@contexts/UpdateContext';
import {
    faDownload,
    faGear,
    faPowerOff,
    faRotate
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
                icon={faGear}
                label="Settings"
                onClick={() => {
                    setCurrentOverlay(Overlays.Settings);
                    toggleOverlay();
                }}
                className="bg-pepper-900/75 hover:bg-pepper-900 active:bg-pepper-800 text-pepper-200 active:text-snow-300"
            />
            <NavItem
                icon={updateAvailable ? faDownload : faRotate}
                label={updateAvailable ? 'Install update' : 'Check for update'}
                onClick={updateAvailable ? installUpdate : checkForUpdate}
                labelShown={updateAvailable}
                className={clsx(
                    'bg-pepper-900/75 hover:bg-pepper-900 active:bg-pepper-800 text-pepper-200',
                    updateAvailable
                        ? 'hover:animate-none animate-bounce bg-gradient-to-tr from-leaf-500 to-leaf-550 text-pepper-200 active:brightness-90 active:text-pepper-200'
                        : 'active:text-snow-300'
                )}
            />
            <NavItem
                icon={faPowerOff}
                label="Quit"
                className="bg-pepper-900/75 hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200 active:brightness-90 active:text-pepper-200"
                onClick={() => api.sendOneWay(api.channels.shutdown)}
            />
        </ul>
    );
}
