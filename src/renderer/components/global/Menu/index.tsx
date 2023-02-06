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
    entries: MenuEntry[];
    fullWidth?: boolean;
    disabled?: boolean;
}

export default function Menu({
    button,
    entries,
    alignment,
    fullWidth,
    disabled
}: Props) {
    return (
        <HeadlessMenu
            as="div"
            className={clsx('relative w-fit box-border', {
                'w-full': fullWidth
            })}
        >
            <HeadlessMenu.Button className="w-full" disabled={disabled}>
                {button}
            </HeadlessMenu.Button>

            <HeadlessMenu.Items
                as="div"
                className={clsx(
                    'w-max absolute flex flex-col box-border z-50 bg-pepper-200/95 backdrop-blur-2xl rounded-md p-2 gap-1 shadow-xl shadow-pepper-200/25',
                    {
                        'left-0 mt-1': alignment === Alignment.BottomLeft,
                        'right-0 mt-1': alignment === Alignment.BottomRight,
                        'left-0 -top-1 -translate-y-full':
                            alignment === Alignment.TopLeft,
                        'right-0 -top-1 -translate-y-full':
                            alignment === Alignment.TopRight
                    }
                )}
            >
                {entries.map((entry, index) => {
                    if (entry.type === 'seperator') {
                        return (
                            <HeadlessMenu.Item
                                key={index}
                                as="div"
                                className="bg-pepper-200/50 h-0.5 w-[98%] rounded-full self-center"
                            />
                        );
                    } else {
                        return (
                            <HeadlessMenu.Item
                                key={index}
                                as="div"
                                className={clsx(
                                    'flex flex-row gap-2 rounded leading-none py-1.5 pr-2 hover:bg-pepper-400 active:bg-pepper-500 text-snow-500 cursor-pointer min-w-[200px]',
                                    {
                                        'pl-2': !entry.icon
                                    },
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
