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
}

export default function SquareContainer({
    children,
    className,
    tooltip,
    tooltipPlacement,
    notificationBadge
}: Props) {
    return (
        <NotificationBadge showing={notificationBadge ?? false}>
            <Tooltip placement={tooltipPlacement} text={tooltip}>
                <div
                    className={clsx(
                        'h-full aspect-square flex items-center justify-center',
                        className
                    )}
                >
                    {children}
                </div>
            </Tooltip>
        </NotificationBadge>
    );
}
