import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import clsx from 'clsx';
import React from 'react';
import Icon from '../Icon';
import SquareContainer from '../SquareContainer';

interface Props {
    children: JSX.Element;
    buttons: {
        icon: IconDefinition;
        tooltip?: string;
        caution?: boolean;
        onClick: () => void;
    }[];
}

export default function OverlayContent({ children, buttons }: Props) {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-row gap-3 h-fit ml-auto">
                {buttons.map((button, index) => {
                    return (
                        <SquareContainer
                            key={index}
                            tooltip={button.tooltip}
                            tooltipPlacement="bottom"
                            onClick={button.onClick}
                            className={clsx('rounded-md p-2.5 cursor-pointer', {
                                'bg-pepper-700 text-snow-500 hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200':
                                    button.caution,
                                'text-snow-500 bg-pepper-700 hover:bg-pepper-800':
                                    !button.caution
                            })}
                        >
                            <Icon sprite={button.icon} size="1x" />
                        </SquareContainer>
                    );
                })}
            </div>
            {children}
        </div>
    );
}
