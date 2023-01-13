import React from 'react';

interface Props {
    label: string;
    text: string;
}

export default function TextInformation({ label, text }: Props) {
    return (
        <div className="flex flex-col gap-2 grow">
            <span className="text-snow-300 leading-none">{label}</span>
            <p className="text-snow-300/50">{text}</p>
        </div>
    );
}
