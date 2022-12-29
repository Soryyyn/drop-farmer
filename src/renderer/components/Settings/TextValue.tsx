import React from 'react';

interface Props {
    setting: newSetting;
    onChange: (updated: any) => void;
}

export default function TextValue({ setting, onChange }: Props) {
    return (
        <input
            className="w-full text-center bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800"
            disabled={setting.disabled}
            value={setting.value as string}
            type="text"
            onInput={(event) => {
                onChange(event.currentTarget.value);
            }}
        />
    );
}
