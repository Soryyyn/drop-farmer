import React from 'react';

interface Props {
    children: JSX.Element;
}

export default function OverlayContainer({ children }: Props) {
    return (
        <div className="relative box-border p-6 h-modal w-modal bg-pepper-600 rounded-xl shadow-xl shadow-pepper-600/25">
            {children}
        </div>
    );
}
