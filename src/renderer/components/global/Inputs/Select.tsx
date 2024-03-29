import { SelectOption } from '@df-types/settings.types';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import React from 'react';
import Icon from '../Icon';
import Menu from '../Menu';

interface Props {
    label?: string;
    value: SelectOption<any>;
    fullWidth?: boolean;
    disabled?: boolean;
    options: SelectOption<any>[];
    onChange: (changed: any) => void;
}

export default function Select({
    label,
    value,
    fullWidth,
    disabled,
    options,
    onChange
}: Props) {
    return (
        <div className="flex flex-col gap-2 grow">
            {label && (
                <div className="flex flex-row leading-none gap-1">
                    <span className="text-snow-300">{label}</span>
                </div>
            )}

            <Menu
                disabled={disabled}
                fullWidth={fullWidth}
                entries={options.map((option) => {
                    return {
                        type: 'normal',
                        label: option.display,
                        onClick: () => onChange(option.value)
                    };
                })}
                button={
                    <div
                        className={clsx(
                            'w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none text-snow-300 capitalize text-left h-[33.5px] flex flex-row items-center gap-2',
                            {
                                'hover:bg-pepper-800 focus:bg-pepper-800 cursor-pointer':
                                    !disabled
                            }
                        )}
                    >
                        <span>{value.display}</span>
                        <Icon
                            sprite={faChevronDown}
                            size="sm"
                            className="ml-auto"
                        />
                    </div>
                }
            />
        </div>
    );
}
