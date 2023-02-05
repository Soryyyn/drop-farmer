import React from 'react';
import ReactInputMask from 'react-input-mask';

interface Props {
    mask: string;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    onChange: (changed: string) => void;
}

export default function MaskedInput({
    mask,
    placeholder,
    disabled,
    value,
    onChange
}: Props) {
    return (
        <ReactInputMask
            value={value}
            mask={mask}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className="bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 h-[33.5px] placeholder:text-snow-300/50"
        />
    );
}
