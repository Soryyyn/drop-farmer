import { AlignmentContextProvider } from '@renderer/util/contexts';
import React from 'react';

interface Props {
    children: JSX.Element;
}

export default function OverlayContainer({ children }: Props) {
    return (
        <AlignmentContextProvider>
            <div className="relative box-border p-6 h-modal w-modal bg-pepper-600/95 rounded-xl backdrop-blur-2xl shadow-xl shadow-pepper-600/25">
                {children}
            </div>
        </AlignmentContextProvider>
    );
}
