import { OpacityScaleTransition } from '@util/transitions';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface Props {
    children: JSX.Element;
    showing: boolean;
}

export default function Overlay({ children, showing }: Props) {
    return (
        <AnimatePresence>
            {showing && (
                <motion.div
                    className="z-50 absolute h-full w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all origin-center"
                    initial={OpacityScaleTransition.initial}
                    animate={OpacityScaleTransition.animate}
                    exit={OpacityScaleTransition.exit}
                    transition={OpacityScaleTransition.transition}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
