import { Icon } from '@components/global/Icon';
import Menu from '@components/global/Menu';
import { Alignment } from '@components/global/Menu/types';
import {
    faEllipsisVertical,
    faEye,
    faEyeSlash,
    faRotate,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FarmContext } from '@util/contexts';
import React, { useContext, useState } from 'react';
import StatusIndicator from './StatusIndicator';

export default function SidebarItem() {
    const { farm, setWindowsVisibility, clearCache, restartSchedule } =
        useContext(FarmContext);
    const [displayingWindows, setDisplayingWindows] = useState<boolean>(false);

    return (
        <div className="w-full pl-2 py-2 pr-4 flex flex-row items-center gap-2 bg-pepper-900/75 rounded-lg">
            <StatusIndicator status={farm!.status} />
            <div className="py-2 pl-1 leading-none text-pepper-100 text-lg grow capitalize tracking-wider">
                {farm?.name}
            </div>

            <Menu
                button={
                    <div className="flex items-center justify-center text-pepper-100 hover:bg-pepper-800/50 active:bg-pepper-800 active:text-snow-500 aspect-square p-1 rounded cursor-pointer">
                        <Icon sprite={faEllipsisVertical} size="lg" />
                    </div>
                }
                alignment={Alignment.BottomRight}
                containerStyling="z-50 mt-1 bg-pepper-600/95 backdrop-blur-2xl rounded-md p-2 gap-1"
                entryItemsStyling="gap-2 rounded leading-none py-1.5 pr-2 hover:bg-pepper-500 active:bg-pepper-400 text-snow-500"
                entries={[
                    {
                        label: displayingWindows
                            ? 'Hide windows'
                            : 'Show windows',
                        icon: (
                            <Icon
                                sprite={displayingWindows ? faEyeSlash : faEye}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => {
                            setDisplayingWindows(!displayingWindows);
                            setWindowsVisibility(!displayingWindows);
                        }
                    },
                    {
                        label: 'Restart farm',
                        icon: (
                            <Icon
                                sprite={faRotate}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => restartSchedule()
                    },
                    {
                        label: 'Clear cache',
                        caution: true,
                        icon: (
                            <Icon sprite={faTrash} size="1x" className="mx-1" />
                        ),
                        onClick: () => clearCache()
                    }
                ]}
            />
        </div>
    );
}
