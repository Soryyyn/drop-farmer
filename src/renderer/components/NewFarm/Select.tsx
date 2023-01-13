import Menu, { Alignment } from '@components/global/Menu';
import React from 'react';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    value: any;
    options: any[];
    required: boolean;
    onSelected: (selected: any) => void;
}

export default function Select({
    label,
    value,
    options,
    required,
    onSelected
}: Props) {
    return (
        <div className="flex flex-col gap-2 grow">
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <Menu
                button={
                    <div className="w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 capitalize text-left">
                        {value}
                    </div>
                }
                fullWidth={true}
                alignment={Alignment.BottomLeft}
                entries={options.map((option) => {
                    return {
                        type: 'normal',
                        label: api.capitalize(option),
                        onClick: () => onSelected(option)
                    };
                })}
            />
        </div>
    );
}
