import clsx from 'clsx';
import React from 'react';

interface Props {
    content: string;
    className?: string;
    onClick: () => void;
}

export default function InlineLink({ content, className, onClick }: Props) {
    return (
        <span
            className={clsx('inline-flex cursor-pointer', className)}
            onClick={onClick}
        >
            {content}
        </span>
    );
}
