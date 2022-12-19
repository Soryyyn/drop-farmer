import React from 'react';

interface Props {
    children: JSX.Element;
    buttons: JSX.Element | JSX.Element[];
}

export default function OverlayContent({ children, buttons }: Props) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-row gap-3 h-fit ml-auto">{buttons}</div>
            {children}
        </div>
    );
}
