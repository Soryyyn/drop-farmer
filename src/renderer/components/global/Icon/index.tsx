import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React from 'react';

interface Props {
    sprite: IconDefinition | string;
    size: SizeProp;
    className?: string;
}

export function Icon({ sprite, size, className }: Props) {
    if (typeof sprite === 'object') {
        return (
            <FontAwesomeIcon
                icon={sprite}
                size={size}
                className={className}
                fixedWidth={true}
            />
        );
    } else {
        return (
            <span
                className={clsx(className, `text-${size} w-fit leading-none`)}
            >
                {sprite}
            </span>
        );
    }
}
