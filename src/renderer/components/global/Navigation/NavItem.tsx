import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import clsx from 'clsx';
import React from 'react';
import Icon from '../Icon';
import NotificationBadge from '../NotificationBadge';

type Props = {
    label: string;
    icon: IconDefinition;
    className?: string;
    withBadge?: boolean;
    onClick: () => void;
};

export default function NavItem({
    label,
    icon,
    className,
    withBadge,
    onClick
}: Props) {
    return (
        <NotificationBadge showing={withBadge ?? false}>
            <li
                className={clsx(
                    className,
                    'h-[40px] flex flex-row items-center justify-center gap-1.5 rounded-lg select-none cursor-pointer transition-all p-3 active:outline outline-2 outline-offset-2 outline-snow-300/50'
                )}
                onClick={onClick}
            >
                <Icon sprite={icon} size="1x" />
                <p className="leading-none font-semibold text-sm">{label}</p>
            </li>
        </NotificationBadge>
    );
}
