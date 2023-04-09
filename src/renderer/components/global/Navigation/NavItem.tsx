import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import clsx from 'clsx';
import React, { useState } from 'react';
import Icon from '../Icon';

type Props = {
    label: string;
    icon: IconDefinition;
    className?: string;
    labelShown?: boolean;
    onClick: () => void;
};

export default function NavItem({
    label,
    icon,
    className,
    labelShown,
    onClick
}: Props) {
    const [isHovering, setIsHovering] = useState(labelShown ?? false);

    return (
        <li
            className={clsx(
                className,
                'bg-pepper-900/75 hover:bg-pepper-900 active:bg-pepper-800 active:text-snow-300 text-pepper-200 h-[44px] flex flex-row items-center justify-center gap-1.5 rounded-lg select-none cursor-pointer transition-all',
                {
                    'aspect-square': !isHovering,
                    'px-2.5': isHovering
                }
            )}
            onMouseOver={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={onClick}
        >
            <Icon sprite={icon} size="lg" />
            {isHovering && (
                <p className="leading-none font-semibold">{label}</p>
            )}
        </li>
    );
}
