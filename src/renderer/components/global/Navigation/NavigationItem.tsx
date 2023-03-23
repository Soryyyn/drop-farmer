import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React from 'react';
import Icon from '../Icon';
import SquareContainer from '../SquareContainer';

interface Props {
    icon: IconDefinition;
    tooltip: string;
    className?: string;
    onClick: () => void;
}

export default function NavigationItem({
    icon,
    tooltip,
    className,
    onClick
}: Props) {
    return (
        <SquareContainer
            onClick={onClick}
            tooltip={tooltip}
            tooltipPlacement="bottom"
            className={clsx(
                {
                    'rounded-lg select-none p-3 cursor-pointer bg-pepper-900/75 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 text-pepper-200':
                        !className
                },
                className
            )}
        >
            <Icon sprite={icon} size="lg" />
        </SquareContainer>
    );
}
