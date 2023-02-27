import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import Icon from '../Icon';

interface Props {
    label?: string;
    value: number;
    min: number;
    max: number;
    fullWidth?: boolean;
    disabled?: boolean;
    withButtons?: boolean;
    inputWidth?: string;
    onChange: (changed: number) => void;
}

export default function NumberInput({
    label,
    value,
    min,
    max,
    fullWidth,
    disabled,
    withButtons,
    onChange
}: Props) {
    const [inputValue, setInputValue] = useState<number>(value);

    useEffect(() => {
        onChange(inputValue);
    }, [inputValue]);

    return (
        <div className="flex flex-col gap-2 grow">
            {label && (
                <div className="flex flex-row leading-none gap-1">
                    <span className="text-snow-300">{label}</span>
                </div>
            )}

            <div className="flex flex-row gap-1 justify-center">
                {withButtons && (
                    <button
                        disabled={disabled}
                        onClick={() => {
                            if (value < max) {
                                setInputValue(value + 1);
                            }
                        }}
                        className={clsx(
                            'flex justify-center items-center  bg-pepper-700 rounded aspect-square px-2 text-snow-300 ',
                            {
                                'hover:bg-pepper-800 cursor-pointer': !disabled
                            }
                        )}
                    >
                        <Icon sprite={faPlus} size="sm" />
                    </button>
                )}
                <input
                    className={clsx(
                        'text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none text-snow-300 caret-snow-500',
                        {
                            'w-full': fullWidth,
                            'w-1/3': !fullWidth,
                            'hover:bg-pepper-800 focus:bg-pepper-800': !disabled
                        }
                    )}
                    type="number"
                    disabled={disabled}
                    value={value}
                    onChange={(event) => {
                        const { value, min, max } = event.target;
                        const adjustedValue = Math.max(
                            Number(min),
                            Math.min(Number(max), Number(value))
                        );

                        setInputValue(adjustedValue);
                    }}
                    min={min}
                    max={max}
                />
                {withButtons && (
                    <button
                        disabled={disabled}
                        onClick={() => {
                            if (value > min) {
                                setInputValue(value - 1);
                            }
                        }}
                        className={clsx(
                            'flex justify-center items-center  bg-pepper-700 rounded aspect-square px-2 text-snow-300 ',
                            {
                                'hover:bg-pepper-800 cursor-pointer': !disabled
                            }
                        )}
                    >
                        <Icon sprite={faMinus} size="sm" />
                    </button>
                )}
            </div>
        </div>
    );
}
