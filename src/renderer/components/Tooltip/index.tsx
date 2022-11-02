import Tippy from "@tippyjs/react";
import React from "react";
import 'tippy.js/dist/tippy.css';

interface Props {
    children: JSX.Element;
    tooltipText: string;
    placement: any;
}

export default function Tooltip({ children, tooltipText, placement }: Props) {
    return (
        <Tippy
            content={tooltipText}
            placement={placement}
            delay={[500, 0]}
            duration={[0, 0]}
            theme="dark"
        >
            {children}
        </Tippy>
    );
}
