import { Transition } from 'framer-motion';

export type CustomTransition = {
    transition: Transition;
    initial: {
        [x: string]: any;
    };
    animate: {
        [x: string]: any;
    };
    exit?: {
        [x: string]: any;
    };
};

export const OpacityScaleTransition: CustomTransition = {
    transition: {
        duration: 0.1,
        ease: 'easeIn'
    },
    initial: {
        position: 'absolute',
        transformOrigin: 'center',
        top: '0',
        left: '0',
        scale: 0.9
    },
    animate: {
        scale: 1
    },
    exit: {
        scale: 0.5,
        opacity: 0,
        transition: {
            duration: 0.1,
            ease: 'easeOut'
        }
    }
};
