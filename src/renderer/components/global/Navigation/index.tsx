import { ModalContext } from '@contexts/ModalContext';
import { UpdateContext } from '@contexts/UpdateContext';
import {
    faDownload,
    faGear,
    faGlobe,
    faPowerOff,
    faRotate
} from '@fortawesome/free-solid-svg-icons';
import React, { useContext } from 'react';
import { Overlays } from '../Overlay/types';
import NavigationItem from './NavigationItem';

export default function Navigation() {
    const { updateAvailable, checkForUpdate, installUpdate } =
        useContext(UpdateContext);
    const { setCurrentOverlay, toggleOverlay } = useContext(ModalContext);

    return (
        <div className="flex flex-row items-center justify-center gap-3">
            {updateAvailable ? (
                <NavigationItem
                    icon={faDownload}
                    tooltip="Install update"
                    className="rounded-lg select-none p-3 cursor-pointer bg-gradient-to-tr from-leaf-500 to-leaf-550 hover:brightness-95 active:brightness-[85%] active:text-pepper-200"
                    onClick={installUpdate}
                />
            ) : (
                <NavigationItem
                    icon={faRotate}
                    tooltip="Check for updates"
                    onClick={checkForUpdate}
                />
            )}
            <NavigationItem
                icon={faGlobe}
                tooltip="Website"
                onClick={() =>
                    api.sendOneWay(
                        api.channels.openLinkInExternal,
                        'https://drop-farmer.soryn.dev'
                    )
                }
            />
            <NavigationItem
                icon={faGear}
                tooltip="Settings"
                onClick={() => {
                    setCurrentOverlay(Overlays.Settings);
                    toggleOverlay();
                }}
            />
            <NavigationItem
                icon={faPowerOff}
                tooltip="Quit"
                className="rounded-lg select-none p-3 cursor-pointer bg-pepper-900/75 hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:brightness-95 active:brightness-[85%] text-pepper-200"
                onClick={() => api.sendOneWay(api.channels.shutdown)}
            />
        </div>
    );
}
