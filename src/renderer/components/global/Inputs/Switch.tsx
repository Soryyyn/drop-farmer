import { Switch as SwitchInput } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

interface Props {
    label?: string;
    value: boolean;
    fullWidth?: boolean;
    disabled?: boolean;
    onChange: (updated: boolean) => void;
}

export default function Switch({
    label,
    value,
    fullWidth,
    disabled,
    onChange
}: Props) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <div className="flex flex-row leading-none gap-1">
                    <span className="text-snow-300">{label}</span>
                </div>
            )}

            <SwitchInput
                checked={value}
                onChange={onChange}
                disabled={disabled}
                className={clsx(
                    'relative w-16 flex items-center rounded-md p-1 transition-all bg-gradient-to-tr',
                    {
                        'bg-pepper-700': !value,
                        'from-blood-500 to-blood-550': value
                    }
                )}
            >
                <span
                    className={clsx(
                        'inline-block h-5 w-5 rounded transform transition-all',
                        {
                            'bg-snow-500 translate-x-0': !value as boolean,
                            'bg-blood-700 translate-x-9': value as boolean
                        }
                    )}
                />
            </SwitchInput>
        </div>
    );
}
