import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    required: boolean;
    value: boolean;
    onChange: (updated: boolean) => void;
}

export default function SwitchToggle({
    label,
    required,
    value,
    onChange
}: Props) {
    return (
        <div className="flex flex-col gap-2 grow">
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <Switch
                checked={value}
                onChange={onChange}
                className={clsx(
                    'relative w-16 flex items-center rounded-md p-1 transition-all',
                    {
                        'bg-pepper-700': !value,
                        'bg-blood-500': value
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
            </Switch>
        </div>
    );
}
