import Tippy from '@tippyjs/react';
import React from 'react';
import 'tippy.js/dist/tippy.css';

interface Props {
    children: JSX.Element;
    text: string;
    placement: any;
}

export default function Tooltip({ children, text, placement }: Props) {
    return (
        <Tippy
            content={text}
            placement={placement}
            delay={[500, 0]}
            duration={[0, 0]}
            theme="dark"
        >
            {children}
        </Tippy>
    );
}
