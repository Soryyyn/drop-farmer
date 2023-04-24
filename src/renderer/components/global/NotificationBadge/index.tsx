import React from 'react';

interface Props {
    children: JSX.Element;
    showing: boolean;
}

export default function NotificationBadge({ children, showing }: Props) {
    if (showing) {
        return (
            <>
                <div className="relative">
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-tr from-blood-500 to-blood-550 rounded-full" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-tr from-blood-500 to-blood-550 rounded-full animate-ping duration-1000" />
                    {children}
                </div>
            </>
        );
    } else {
        return children;
    }
}
