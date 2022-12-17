import { CustomTransition } from '@util/transitions';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';

interface Props {
    children: JSX.Element;
    showing: boolean;
    transition: CustomTransition;
    className?: string;
}

export default function AnimateMount({
    children,
    showing,
    transition,
    className
}: Props) {
    return (
        <AnimatePresence>
            {showing && (
                <motion.div
                    layout={true}
                    className={className}
                    initial={transition.initial}
                    animate={transition.animate}
                    exit={transition.exit}
                    transition={transition.transition}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
