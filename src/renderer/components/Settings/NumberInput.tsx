import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function NumberInput({ setting, onChange }: Props) {
    const numberInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-row justify-center gap-1">
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2  text-snow-300 hover:bg-pepper-800"
                disabled={setting.changingDisabled}
                onClick={() => {
                    if (numberInputRef.current?.value)
                        if (parseInt(numberInputRef.current.value) < 60) {
                            numberInputRef.current.value = (
                                parseInt(numberInputRef.current.value) + 1
                            ).toString();
                        }
                }}
            >
                <FontAwesomeIcon icon={faPlus} size="sm" fixedWidth={true} />
            </button>
            <input
                ref={numberInputRef}
                className="w-1/3 text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800"
                value={setting.value as number}
                disabled={setting.changingDisabled}
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
                    if (value < setting.min!) {
                        value = 1;
                    } else if (value > setting.max!) {
                        value = 60;
                    }

                    onChange(value);
                }}
            />
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2 text-snow-300 hover:bg-pepper-800"
                disabled={setting.changingDisabled}
                onClick={() => {
                    if (numberInputRef.current?.value)
                        if (parseInt(numberInputRef.current.value) > 1) {
                            numberInputRef.current.value = (
                                parseInt(numberInputRef.current.value) - 1
                            ).toString();
                        }
                }}
            >
                <FontAwesomeIcon icon={faMinus} size="sm" fixedWidth={true} />
            </button>
        </div>
    );
}
