import { Switch } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function SwitchToggle({ setting, onChange }: Props) {
    return (
        <Switch
            checked={setting.value as boolean}
            onChange={onChange}
            className={clsx(
                'relative w-16 flex items-center rounded-md p-1 transition-all',
                {
                    'bg-pepper-700': !setting.value as boolean,
                    'bg-blood-600': setting.value as boolean
                }
            )}
        >
            <span
                className={clsx(
                    'inline-block h-5 w-5 rounded transform transition-all',
                    {
                        'bg-snow-500 translate-x-0': !setting.value as boolean,
                        'bg-blood-700 translate-x-9': setting.value as boolean
                    }
                )}
            />
        </Switch>
    );
}
