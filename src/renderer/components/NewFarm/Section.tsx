import React from 'react';

interface Props {
    children: JSX.Element | JSX.Element[];
    title: string;
}

export default function Section({ children, title }: Props) {
    return (
        <div className="flex flex-col bg-pepper-500 rounded-md p-4 gap-4">
            <span className="text-snow-500 font-medium text-xl leading-none">
                {title}
            </span>
            <div>{children}</div>
        </div>
    );
}
