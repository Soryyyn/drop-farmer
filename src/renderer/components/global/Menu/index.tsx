import { Menu as HeadlessMenu } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';
import { Alignment, MenuEntry } from './types';

interface Props {
    button: JSX.Element;
    alignment: Alignment;
    containerStyling?: string;
    entryItemsStyling?: string;
    entries: MenuEntry[];
}

export default function Menu({
    button,
    entries,
    containerStyling,
    entryItemsStyling,
    alignment
}: Props) {
    return (
        <HeadlessMenu as="div" className="relative w-fit box-border">
            <HeadlessMenu.Button>{button}</HeadlessMenu.Button>

            <HeadlessMenu.Items
                as="div"
                className={clsx(
                    containerStyling,
                    'w-max absolute flex flex-col box-border',
                    alignment === Alignment.BottomLeft && 'left-0',
                    alignment === Alignment.BottomRight && 'right-0',
                    alignment === Alignment.TopLeft &&
                        'left-0 top-0 -translate-y-full',
                    alignment === Alignment.TopRight &&
                        'right-0 top-0 -translate-y-full'
                )}
            >
                {entries.map((entry) => (
                    <HeadlessMenu.Item
                        key={entry.label}
                        as="div"
                        className={clsx(
                            'flex flex-row',
                            entryItemsStyling,
                            {
                                'text-blood-400': entry.caution
                            },
                            entry.styling
                        )}
                        onClick={entry.onClick}
                    >
                        {entry.icon}
                        <span>{entry.label}</span>
                    </HeadlessMenu.Item>
                ))}
            </HeadlessMenu.Items>
        </HeadlessMenu>
    );
}
