import { Icon } from '@components/global/Icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function NumberInput({ setting, onChange }: Props) {
    const [value, setValue] = useState<number>(setting.value as number);

    useEffect(() => {
        onChange(value);
    }, [value]);

    return (
        <div className="flex flex-row justify-center gap-1">
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2  text-snow-300 hover:bg-pepper-800"
                disabled={setting.disabled}
                onClick={() => {
                    if (value < setting.max!) {
                        setValue(value + 1);
                    }
                }}
            >
                <Icon sprite={faPlus} size="sm" />
            </button>
            <input
                className="w-1/3 text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800"
                value={value}
                disabled={setting.disabled}
                type="number"
                onChange={(event) => {
                    if (value > 0) setValue(0);

                    /**
                     * Check for min and max values.
                     */
                    if (value < setting.min!) {
                        setValue(setting.min!);
                    } else if (value > setting.max!) {
                        setValue(setting.max!);
                    }
                }}
            />
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2 text-snow-300 hover:bg-pepper-800"
                disabled={setting.disabled}
                onClick={() => {
                    if (value > setting.min!) {
                        setValue(value - 1);
                    }
                }}
            >
                <Icon sprite={faMinus} size="sm" />
            </button>
        </div>
    );
}
