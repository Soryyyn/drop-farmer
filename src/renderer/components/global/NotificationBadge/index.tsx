import React from 'react';

interface Props {
    children: JSX.Element;
    showing: boolean;
}

export default function NotificationBadge({ children, showing }: Props) {
    if (showing) {
        return (
            <div className="relative">
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blood-500 rounded-full" />
                {children}
            </div>
        );
    } else {
        return children;
    }
}
