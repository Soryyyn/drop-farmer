import { Menu as HeadlessMenu } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';
import { Alignment, MenuEntry } from './types';

interface Props {
    button: {
        element: JSX.Element | string;
        className: string;
    };
    entries: MenuEntry[];
    alignment: Alignment;
}

export default function Menu({ button, entries, alignment }: Props) {
    return (
        <HeadlessMenu as="div" className="relative w-fit box-border">
            <HeadlessMenu.Button
                className={clsx(
                    'aspect-square flex justify-center items-center p-2',
                    button.className
                )}
            >
                {button.element}
            </HeadlessMenu.Button>

            <HeadlessMenu.Items
                as="div"
                className={clsx(
                    'w-max absolute my-2 p-2 flex flex-col gap-2 box-border bg-blue-700',
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
                        className={clsx('bg-green-400', entry.styling)}
                    >
                        {entry.label}
                    </HeadlessMenu.Item>
                ))}
            </HeadlessMenu.Items>
        </HeadlessMenu>
    );
}
