import { Menu as HeadlessMenu } from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

export type MenuEntry = {
    type: 'normal' | 'seperator';
    label: string;
    icon?: JSX.Element;
    disabled?: boolean;
    caution?: boolean;
    styling?: string;
    onClick: () => void;
};

export enum Alignment {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}

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
                {entries.map((entry, index) => {
                    if (entry.type === 'seperator') {
                        return (
                            <HeadlessMenu.Item
                                key={index}
                                as="div"
                                className="bg-pepper-500/50 h-0.5 w-[98%] rounded-full self-center"
                            />
                        );
                    } else {
                        return (
                            <HeadlessMenu.Item
                                key={index}
                                as="div"
                                className={clsx(
                                    'flex flex-row',
                                    entryItemsStyling,
                                    entry.styling,
                                    {
                                        'text-blood-400': entry.caution,
                                        'text-snow-500/50 cursor-default':
                                            entry.disabled && !entry.caution,
                                        'text-blood-400/50 cursor-default':
                                            entry.disabled && entry.caution
                                    }
                                )}
                                onClick={
                                    entry.disabled ? undefined : entry.onClick
                                }
                            >
                                {entry.icon}
                                <span>{entry.label}</span>
                            </HeadlessMenu.Item>
                        );
                    }
                })}
            </HeadlessMenu.Items>
        </HeadlessMenu>
    );
}
