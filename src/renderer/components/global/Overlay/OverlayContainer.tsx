import React from 'react';

interface Props {
    children: JSX.Element;
}

export function OverlayContainer({ children }: Props) {
    return (
        <div className="relative box-border p-6 h-modal w-modal bg-pepper-600 rounded-xl backdrop-blur-xl">
            {children}
        </div>
    );
}
