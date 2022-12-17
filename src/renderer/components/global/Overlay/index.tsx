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
            className="z-50 absolute h-full w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all origin-center"
        >
            {children}
        </AnimateMount>
    );
}
