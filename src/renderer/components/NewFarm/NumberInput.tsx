import { Icon } from '@components/global/Icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useState } from 'react';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    required: boolean;
    value: number;
    min: number;
    max: number;
    onChange: (updated: number) => void;
}

export default function NumberInput({
    label,
    value,
    required,
    min,
    max,
    onChange
}: Props) {
    const [inputValue, setInputValue] = useState<number>(value);

    useEffect(() => {
        if (value < 0) setInputValue(0);

        if (value < min) {
            setInputValue(min);
        } else if (value > max) {
            setInputValue(max);
        } else {
            onChange(inputValue);
        }
    }, [inputValue]);

    return (
        <div className="flex flex-col gap-2 grow">
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <div className="flex flex-row gap-1">
                <button
                    className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2  text-snow-300 hover:bg-pepper-800"
                    onClick={() => {
                        if (value < max) {
                            setInputValue(value + 1);
                        }
                    }}
                >
                    <Icon sprite={faPlus} size="sm" />
                </button>
                <input
                    className="w-1/3 text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 grow"
                    value={value}
                    type="number"
                    onInput={(event) => {
                        setInputValue(parseInt(event.currentTarget.value));
                    }}
                />
                <button
                    className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2 text-snow-300 hover:bg-pepper-800"
                    onClick={() => {
                        if (value > min) {
                            setInputValue(value - 1);
                        }
                    }}
                >
                    <Icon sprite={faMinus} size="sm" />
                </button>
            </div>
        </div>
    );
}
