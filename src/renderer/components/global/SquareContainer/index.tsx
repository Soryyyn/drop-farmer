import clsx from 'clsx';
import React from 'react';
import NotificationBadge from '../NotificationBadge';
import Tooltip from '../Tooltip';

interface Props {
    children: JSX.Element | JSX.Element[];
    className?: string;
    tooltip?: string | JSX.Element;
    tooltipPlacement?: any;
    notificationBadge?: boolean;
    onClick?: () => void;
}

export default function SquareContainer({
    children,
    className,
    tooltip,
    tooltipPlacement,
    notificationBadge,
    onClick
}: Props) {
    return (
        <NotificationBadge showing={notificationBadge ?? false}>
            <Tooltip placement={tooltipPlacement} text={tooltip}>
                <div
                    onClick={onClick}
                    className={clsx(
                        'h-full aspect-square flex items-center justify-center transition-all',
                        className
                    )}
                >
                    {children}
                </div>
            </Tooltip>
        </NotificationBadge>
    );
}
