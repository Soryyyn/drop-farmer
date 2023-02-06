import clsx from 'clsx';
import React from 'react';

interface Props {
    label?: string;
    value: string;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange: (changed: string) => void;
}

export default function TextInput({
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

            <input
                disabled={disabled}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={clsx(
                    'bg-pepper-700 px-2 py-1 rounded focus:outline-none text-snow-300 h-[33.5px] placeholder:text-snow-300/50 caret-snow-500',
                    {
                        'w-fit': !fullWidth,
                        'hover:bg-pepper-800 focus:bg-pepper-800': !disabled
                    }
                )}
            />
        </div>
    );
}
