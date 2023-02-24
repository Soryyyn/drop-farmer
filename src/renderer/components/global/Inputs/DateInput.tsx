import clsx from 'clsx';
import React from 'react';
import MaskedInput from './MaskedInput';

interface Props {
    label?: string;
    value?: string;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange: (changed: string) => void;
}

export default function DateInput({
    label,
    value,
    fullWidth,
    disabled,
    onChange
}: Props) {
    return (
        <div
            className={clsx('flex flex-col gap-2', {
                grow: fullWidth
            })}
        >
            {label && (
                <div className="flex flex-row leading-none gap-1">
                    <span className="text-snow-300">{label}</span>
                </div>
            )}

            <MaskedInput
                mask="99-99-9999"
                placeholder="DD-MM-YYYY"
                disabled={disabled}
                value={value !== '' ? value : undefined}
                onChange={onChange}
            />
        </div>
    );
}
