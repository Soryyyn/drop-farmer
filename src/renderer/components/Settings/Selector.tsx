import clsx from 'clsx';
import React from 'react';

interface Props {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function Selector({ label, isSelected, onClick }: Props) {
    return (
        <li
            className={clsx(
                'p-4 text-snow-300 capitalize rounded-md truncate cursor-pointer hover:bg-pepper-500 active:bg-pepper-400',
                {
                    'bg-pepper-400': isSelected
                }
            )}
            onClick={onClick}
        >
            {label}
        </li>
    );
}
