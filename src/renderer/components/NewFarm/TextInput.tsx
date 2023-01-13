import React from 'react';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    required: boolean;
    value: string;
    onChange: (updated: string) => void;
}

export default function TextInput({ label, required, value, onChange }: Props) {
    return (
        <div className="flex flex-col gap-2 grow">
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <input
                className="bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 h-[33.5px]"
                onChange={(event) => onChange(event.target.value)}
                value={value}
            />
        </div>
    );
}
