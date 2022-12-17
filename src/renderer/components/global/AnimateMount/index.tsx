import React from 'react';
import { animated, useTransition } from 'react-spring';

interface Props {
    children: JSX.Element;
    showing: Boolean;
    transition: Object;
    containerClassName?: string;
}

export default function AnimateMount({
    children,
    showing,
    transition,
    containerClassName
}: Props) {
    return useTransition(
        showing,
        transition
    )(
        (styles, shouldBeShown) =>
            shouldBeShown && (
                <animated.div style={styles} className={containerClassName}>
                    {children}
                </animated.div>
            )
    );
}
