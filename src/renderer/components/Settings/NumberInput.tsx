import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef } from 'react';
interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function NumberInput({ setting, onChange }: Props) {
    const numberInputRef = useRef<any>();

    return (
        <div className="flex flex-row justify-center gap-1">
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2  text-snow-300 hover:bg-pepper-800"
                disabled={setting.changingDisabled}
                onClick={() => {
                    if (parseInt(numberInputRef.current.value) < 60) {
                        numberInputRef.current.value = (
                            parseInt(numberInputRef.current.value) + 1
                        ).toString();
                        onChange(parseInt(numberInputRef.current.value));
                    }
                }}
            >
                <FontAwesomeIcon icon={faPlus} size="sm" fixedWidth={true} />
            </button>
            <input
                ref={numberInputRef}
                className="w-1/3 text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800"
                value={setting.value?.toString()}
                disabled={setting.changingDisabled}
                type="number"
                onInput={(event) => {
                    /**
                     * Check for NaN.
                     */
                    if (event.currentTarget.value == '')
                        event.currentTarget.value = setting.min!.toString();

                    let value = parseInt(event.currentTarget.value);

                    /**
                     * Check for min and max values.
                     */
                    if (value < setting.min!) {
                        value = setting.min!;
                    } else if (value > setting.max!) {
                        value = setting.max!;
                    }

                    onChange(value);
                }}
            />
            <button
                className="flex justify-center items-center  bg-pepper-700 rounded cursor-pointer aspect-square px-2 text-snow-300 hover:bg-pepper-800"
                disabled={setting.changingDisabled}
                onClick={() => {
                    if (parseInt(numberInputRef.current.value) > 1) {
                        numberInputRef.current.value = (
                            parseInt(numberInputRef.current.value) - 1
                        ).toString();
                        onChange(parseInt(numberInputRef.current.value));
                    }
                }}
            >
                <FontAwesomeIcon icon={faMinus} size="sm" fixedWidth={true} />
            </button>
        </div>
    );
}
