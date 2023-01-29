import React from 'react';
import ReactInputMask from 'react-input-mask';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    value: Date;
    required: boolean;
    onChange: (updated: any) => void;
}

export default function DateInput({ label, value, required, onChange }: Props) {
    return (
        <div className="flex flex-col gap-2 grow" key={label}>
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <ReactInputMask
                className="bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 h-[33.5px] placeholder:text-snow-300/50"
                mask="99-99-9999"
                placeholder="DD-MM-YYYY"
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
