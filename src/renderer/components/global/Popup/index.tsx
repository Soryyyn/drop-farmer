import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useKeyPress } from '@hooks/useKeyPress';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import Icon from '../Icon';
import SquareContainer from '../SquareContainer';

type Props = {
    children: JSX.Element | JSX.Element[];
    title: string;
    showing: boolean;
    onClose: () => void;
};

export default function Popup({ children, title, showing, onClose }: Props) {
    const escape = useKeyPress('Escape');

    useEffect(() => {
        if (escape && showing) onClose();
    }, [escape]);

    return (
        <>
            {showing && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[550px] flex flex-col p-6 rounded-lg bg-pepper-600 shadow-xl shadow-pepper-600/25 gap-2">
                    <div className="flex flex-row gap-3 h-fit items-center">
                        <p className="font-semibold text-3xl uppercase text-snow-500">
                            {title}
                        </p>
                        <SquareContainer
                            tooltipPlacement="bottom"
                            onClick={onClose}
                            className={clsx(
                                'ml-auto rounded-md p-2.5 cursor-pointer bg-pepper-700 text-snow-500 hover:bg-gradient-to-tr hover:from-blood-500 hover:to-blood-550 hover:text-pepper-200 active:brightness-90'
                            )}
                        >
                            <Icon sprite={faClose} size="1x" />
                        </SquareContainer>
                    </div>
                    <div className="overflow-y-auto">{children}</div>
                </div>
            )}
        </>
    );
}
