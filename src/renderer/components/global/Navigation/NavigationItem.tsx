import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Tooltip from '../Tooltip';

interface Props {
    icon: IconDefinition;
    tooltip: string;
    onClick: () => void;
}

export default function NavigationItem({ icon, tooltip, onClick }: Props) {
    return (
        <Tooltip tooltipText={tooltip} placement="bottom">
            <div
                className="flex items-center justify-center rounded-lg aspect-square select-none p-3 cursor-pointer bg-pepper-900/90 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300"
                onClick={onClick}
            >
                <FontAwesomeIcon icon={icon} size="lg" />
            </div>
        </Tooltip>
    );
}
