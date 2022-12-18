import {
    faDownload,
    faGear,
    faGlobe,
    faPowerOff,
    faRotate
} from '@fortawesome/free-solid-svg-icons';
import { UpdateContext } from '@util/contexts';
import React, { useContext } from 'react';
import NavigationItem from './NavigationItem';

export default function Navigation() {
    const { status, checkForUpdate, installUpdate } = useContext(UpdateContext);

    console.log(status);

    return (
        <div className="flex flex-row items-center justify-center gap-3">
            {status?.status === 'updateAvailable' ? (
                <NavigationItem
                    icon={faDownload}
                    tooltip="Install update"
                    onClick={() => {}}
                />
            ) : (
                <NavigationItem
                    icon={faRotate}
                    tooltip="Check for updates"
                    onClick={() => {}}
                />
            )}
            <NavigationItem
                icon={faGlobe}
                tooltip="Website"
                onClick={() =>
                    window.api.sendOneWay(
                        window.api.channels.openLinkInExternal,
                        'https://drop-farmer.soryn.dev'
                    )
                }
            />
            <NavigationItem
                icon={faGear}
                tooltip="Settings"
                onClick={() => {}}
            />
            <NavigationItem
                icon={faPowerOff}
                tooltip="Shutdown application"
                onClick={() =>
                    window.api.sendOneWay(window.api.channels.shutdown)
                }
            />
        </div>
    );
}
