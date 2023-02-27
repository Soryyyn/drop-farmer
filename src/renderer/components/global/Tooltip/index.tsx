import Tippy from '@tippyjs/react';
import React from 'react';
import 'tippy.js/animations/shift-away-subtle.css';
import 'tippy.js/dist/tippy.css';

interface Props {
    children: JSX.Element;
    text: string | JSX.Element;
    placement: any;
}

export default function Tooltip({ children, text, placement }: Props) {
    return (
        <Tippy
            content={text}
            placement={placement}
            delay={[300, 0]}
            theme="dark"
            animation="shift-away-subtle"
        >
            {children}
        </Tippy>
    );
}
