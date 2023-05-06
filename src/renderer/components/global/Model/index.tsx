import { SettingsContext } from '@renderer/contexts/SettingsContext';
import React, { useContext } from 'react';

interface Props {
    src: string;
    type: string;
    loop?: boolean;
}

export default function Model({ src, type, loop }: Props) {
    const { getSetting } = useContext(SettingsContext);

    if (
        getSetting('application', 'application-reducedMotion')?.value as boolean
    ) {
        return (
            <video loop={loop} className="relative -z-10">
                <source src={src} type={type} />
            </video>
        );
    } else {
        return (
            <video loop={loop} autoPlay className="relative -z-10">
                <source src={src} type={type} />
            </video>
        );
    }
}
