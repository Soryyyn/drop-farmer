import {
    faChartSimple,
    faDownload,
    faGear,
    faGlobe,
    faPowerOff,
    faRotate
} from '@fortawesome/free-solid-svg-icons';
import { ModalContext, UpdateContext } from '@renderer/util/contexts';
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
                onClick={() => api.sendOneWay(api.channels.shutdown)}
            />
        </div>
    );
}
