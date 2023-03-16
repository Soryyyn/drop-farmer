import clsx from 'clsx';
import React from 'react';

interface Props {
    value: string;
    label?: string;
    disabled?: boolean;
    isPassword?: boolean;
    onChange: (changed: string) => void;
}

export default function TextInput({
    label,
    value,
    disabled,
    isPassword,
    onChange
}: Props) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <div className="flex flex-row leading-none gap-1">
                    <span className="text-snow-300">{label}</span>
                </div>
            )}

            <input
                disabled={disabled}
                spellCheck={false}
                type={isPassword ? 'password' : 'text'}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={clsx(
                    'w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none text-snow-300 caret-snow-500 text-left h-[33.5px] selection:bg-amethyst-550 selection:text-pepper-200',
                    {
                        'hover:bg-pepper-800 focus:bg-pepper-800': !disabled
                    }
                )}
            />
        </div>
    );
}
