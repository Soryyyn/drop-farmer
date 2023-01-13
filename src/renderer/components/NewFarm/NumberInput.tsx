import { Icon } from '@components/global/Icon';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useRef } from 'react';
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
    const numberInputRef = useRef<HTMLInputElement>(null);

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
                        if (numberInputRef.current?.value)
                            if (parseInt(numberInputRef.current.value) < max) {
                                onChange(
                                    parseInt(numberInputRef.current.value) + 1
                                );
                            }
                    }}
                >
                    <Icon sprite={faPlus} size="sm" />
                </button>
                <input
                    ref={numberInputRef}
                    className="w-1/3 text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 grow"
                    value={value}
                    type="number"
                    onInput={(event) => {
                        /**
                         * Check for NaN.
                         */
                        if (event.currentTarget.value == '')
                            event.currentTarget.value = '1';

                        let value = parseInt(event.currentTarget.value);

                        /**
                         * Check for min and max values.
                         */
                        if (value < min) {
                            value = 1;
                        } else if (value > max) {
                            value = 60;
                        }

                        onChange(value);
                    }}
                />
                <button
                    className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2 text-snow-300 hover:bg-pepper-800"
                    onClick={() => {
                        if (numberInputRef.current?.value)
                            if (parseInt(numberInputRef.current.value) > min) {
                                onChange(
                                    parseInt(numberInputRef.current.value) - 1
                                );
                            }
                    }}
                >
                    <Icon sprite={faMinus} size="sm" />
                </button>
            </div>
        </div>
    );
}
