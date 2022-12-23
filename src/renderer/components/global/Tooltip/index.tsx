import Tippy from '@tippyjs/react';
import React from 'react';
import 'tippy.js/animations/shift-away-subtle.css';
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
            theme="dark"
            animation="shift-away-subtle"
        >
            {children}
        </Tippy>
    );
}
