import React from 'react';

interface Props {
    src: string;
    type: string;
    disabled: boolean;
    loop?: boolean;
}

export default function Model({ src, type, disabled, loop }: Props) {
    if (disabled) {
        return (
            <video loop={loop}>
                <source src={src} type={type} />
            </video>
        );
    } else {
        return (
            <video loop={loop} autoPlay>
                <source src={src} type={type} />
            </video>
        );
    }
}
