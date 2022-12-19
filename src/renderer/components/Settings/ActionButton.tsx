import { Icon } from '@components/global/Icon';
import Tooltip from '@components/global/Tooltip';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface Props {
    icon: IconDefinition;
    tooltip?: string;
    onClick: () => void;
}

export function ActionButton({ icon, tooltip, onClick }: Props) {
    return (
        <>
            {tooltip ? (
                <Tooltip text={tooltip} placement="bottom">
                    <div
                        className="flex justify-center items-center aspect-square bg-pepper-700 hover:bg-pepper-800 rounded-md p-2.5 cursor-pointer text-snow-500"
                        onClick={onClick}
                    >
                        <Icon sprite={icon} size="1x" />
                    </div>
                </Tooltip>
            ) : (
                <div
                    className="flex justify-center items-center aspect-square bg-pepper-700 hover:bg-pepper-800 rounded-md p-2.5 cursor-pointer text-snow-500"
                    onClick={onClick}
                >
                    <Icon sprite={icon} size="1x" />
                </div>
            )}
        </>
    );
}
