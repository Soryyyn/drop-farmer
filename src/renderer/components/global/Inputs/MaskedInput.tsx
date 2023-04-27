import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import ReactInputMask from 'react-input-mask';

interface Props {
    mask: string;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    onChange: (changed: string) => void;
}

export default function MaskedInput({
    mask,
    placeholder,
    disabled,
    value,
    onChange
}: Props) {
    const [currentValue, setCurrentValue] = useState(value ?? '');

    useEffect(() => {
        /**
         * Check if value is valid date.
         */
        const regex = /([0-9]{2})-([0-9]{2})-([0-9]{4})/g;
        if (regex.test(currentValue)) {
            onChange(currentValue);
        }
    }, [currentValue, onChange]);

    return (
        <ReactInputMask
            value={currentValue}
            mask={mask}
            placeholder={placeholder}
            onChange={(event) => setCurrentValue(event.currentTarget.value)}
            disabled={disabled}
            className={clsx(
                'w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none text-snow-300 h-[33.5px] placeholder:text-snow-300/50 caret-snow-500 selection:bg-amethyst-550 selection:text-pepper-200',
                {
                    'hover:bg-pepper-800 focus:bg-pepper-800': !disabled
                }
            )}
        />
    );
}
