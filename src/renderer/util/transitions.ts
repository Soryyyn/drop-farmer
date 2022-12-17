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
        opacity: 0,
        height: '98%',
        width: '98%'
    },
    animate: {
        opacity: 1,
        height: '100%',
        width: '100%'
    },
    exit: {
        opacity: 0,
        height: '60%',
        width: '60%',
        transition: {
            duration: 0.1,
            ease: 'easeOut'
        }
    }
};
