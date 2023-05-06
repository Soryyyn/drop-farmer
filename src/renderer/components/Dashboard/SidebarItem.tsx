import {
    faBroom,
    faCalendarDays,
    faClock,
    faEllipsisVertical,
    faEye,
    faEyeSlash,
    faHourglassHalf,
    faRotate,
    faRotateRight,
    faTrash,
    faWindowRestore
} from '@fortawesome/free-solid-svg-icons';
import Icon from '@renderer/components/global/Icon';
import Menu from '@renderer/components/global/Menu';
import SquareContainer from '@renderer/components/global/SquareContainer';
import { FarmContext } from '@renderer/contexts/FarmContext';
import React, { useContext, useEffect, useState } from 'react';
import ProtecedIndicator from './ProtectedIndicator';
import StatusIndicator from './StatusIndicator';

export default function SidebarItem() {
    const {
        farm,
        loginNeeded,
        setWindowsVisibility,
        clearCache,
        restartSchedule,
        deleteSelf,
        resetConditions
    } = useContext(FarmContext);

    const [timeUntilNextCheck, setTimeUntilNextCheck] = useState<string>('...');

    /**
     * Calculate time until next check.
     */
    useEffect(() => {
        const interval = setInterval(() => {
            const currentTime = new Date().getMinutes();
            let nextCheck = 0;

            while (nextCheck < currentTime + 1) nextCheck += farm!.schedule;

            if (farm!.status === 'disabled') {
                setTimeUntilNextCheck('Never');
            } else if (farm!.status === 'checking') {
                setTimeUntilNextCheck('Now');
            } else if (farm!.status === 'attention-required') {
                setTimeUntilNextCheck('Paused');
            } else if (currentTime < nextCheck) {
                setTimeUntilNextCheck(`~${nextCheck - currentTime}min(s)`);
            } else {
                setTimeUntilNextCheck('...');
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, [farm]);

    return (
        <div className="w-full h-min p-4 flex flex-row items-center gap-2 bg-pepper-900/75 rounded-lg">
            <span className="grow flex flex-row gap-2 items-center text-pepper-200 text-lg capitalize font-medium leading-none">
                {window.api.removeTypeFromText(farm!.id)}
            </span>

            {farm?.isProtected && <ProtecedIndicator />}
            <StatusIndicator status={farm!.status} />

            <Menu
                button={
                    <SquareContainer
                        notificationBadge={loginNeeded}
                        className="text-pepper-200 bg-pepper-800/50 hover:bg-pepper-800/75 active:bg-pepper-800 active:text-snow-500 aspect-square p-1 rounded cursor-pointer"
                    >
                        <Icon sprite={faEllipsisVertical} size="lg" />
                    </SquareContainer>
                }
                entries={[
                    {
                        type: 'normal',
                        label: `Amount of windows: ${farm?.amountOfWindows}`,
                        disabled: true,
                        icon: (
                            <Icon
                                sprite={faWindowRestore}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => {}
                    },
                    {
                        type: 'normal',
                        label: `Next check: ${timeUntilNextCheck}`,
                        disabled: true,
                        icon: (
                            <Icon sprite={faClock} size="1x" className="mx-1" />
                        ),
                        onClick: () => {}
                    },
                    {
                        type: 'normal',
                        label: `Time left to fulfill: ${
                            farm?.amountLeftToFulfill === Infinity
                                ? 'Never'
                                : farm?.amountLeftToFulfill! < 0
                                ? 'Finished'
                                : `~${farm?.amountLeftToFulfill}h`
                        }`,
                        disabled: true,
                        icon: (
                            <Icon
                                sprite={faHourglassHalf}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => {}
                    },
                    {
                        type: 'normal',
                        label: `Days until reset: ${
                            farm?.nextConditionReset === Infinity
                                ? 'Never'
                                : farm?.nextConditionReset
                        }`,
                        disabled: true,
                        icon: (
                            <Icon
                                sprite={faCalendarDays}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => {}
                    },
                    {
                        type: 'seperator',
                        label: '',
                        onClick: () => {}
                    },
                    {
                        type: 'normal',
                        label: farm?.windowsShown
                            ? 'Hide windows'
                            : 'Show windows',
                        icon: (
                            <Icon
                                sprite={farm?.windowsShown ? faEyeSlash : faEye}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        disabled: farm?.status === 'disabled',
                        onClick: () => {
                            setWindowsVisibility(!farm?.windowsShown);
                        }
                    },
                    {
                        type: 'normal',
                        label: 'Reset conditions',
                        icon: (
                            <Icon
                                sprite={faRotateRight}
                                size="1x"
                                className="mx-1"
                            />
                        ),
                        onClick: () => resetConditions()
                    },
                    {
                        type: 'normal',
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
                        type: 'normal',
                        label: 'Clear cache',
                        icon: (
                            <Icon sprite={faBroom} size="1x" className="mx-1" />
                        ),
                        onClick: () => clearCache()
                    },
                    {
                        type: 'seperator',
                        label: '',
                        onClick: () => {}
                    },
                    {
                        type: 'normal',
                        label: 'Delete farm',
                        caution: true,
                        disabled: farm?.isProtected,
                        icon: (
                            <Icon sprite={faTrash} size="1x" className="mx-1" />
                        ),
                        onClick: () => deleteSelf()
                    }
                ]}
            />
        </div>
    );
}
