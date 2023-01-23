import { Icon } from '@components/global/Icon';
import Menu, { Alignment } from '@components/global/Menu';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

interface Props {
    setting: Setting;
    onChange: (updated: any) => void;
}

export default function SelectionInput({ setting, onChange }: Props) {
    return (
        <>
            <Menu
                button={
                    <div className="w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 capitalize text-left flex flex-row items-center">
                        <span>{setting.value}</span>
                        <Icon
                            sprite={faChevronDown}
                            size="sm"
                            className="ml-auto"
                        />
                    </div>
                }
                fullWidth={true}
                alignment={Alignment.BottomRight}
                entries={setting.options!.map((option) => {
                    return {
                        type: 'normal',
                        label: api.capitalizeFirstLetter(option),
                        onClick: () => onChange(option)
                    };
                })}
            />
        </>
    );
}
