import { OpacityScaleTransition } from '@util/transitions';
import React from 'react';
import AnimateMount from '../AnimateMount';

interface Props {
    children: JSX.Element;
    showing: boolean;
}

export default function Overlay({ children, showing }: Props) {
    return (
        <AnimateMount
            showing={showing}
            transition={OpacityScaleTransition}
            containerClassName="z-10 absolute h-full w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all"
        >
            <div className="relative box-border p-6 h-modal w-modal bg-pepper-600/95 rounded-xl backdrop-blur-2xl">
                {children}
            </div>
        </AnimateMount>
    );
}
