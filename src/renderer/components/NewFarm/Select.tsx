import { Icon } from '@components/global/Icon';
import Menu, { Alignment } from '@components/global/Menu';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    value: any;
    desc?: string;
    options: any[];
    required: boolean;
    onSelected: (selected: any) => void;
}

export default function Select({
    label,
    value,
    desc,
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
                    <div className="w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 capitalize text-left h-[33.5px] flex flex-row items-center">
                        <span>{value}</span>
                        <Icon
                            sprite={faChevronDown}
                            size="sm"
                            className="ml-auto"
                        />
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

            {desc && <span className="text-snow-300/50">{desc}</span>}
        </div>
    );
}
