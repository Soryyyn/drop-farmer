import clsx from 'clsx';
import React from 'react';

interface Props {
    status: FarmStatus;
}

export default function StatusIndicator({ status }: Props) {
    return (
        <div
            className={clsx('w-2 h-full rounded shadow-xl', {
                'bg-blood-500 shadow-blood-500/50': status === 'disabled',
                'bg-sky-500 shadow-sky-500/50': status === 'attention-required',
                'bg-amber-500 shadow-amber-500/50': status === 'idle',
                'bg-pineapple-500 shadow-pineapple-500/50':
                    status === 'checking',
                'bg-leaf-500 shadow-leaf-500/50': status === 'farming'
            })}
        ></div>
    );
}
