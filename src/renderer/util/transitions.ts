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
        height: '98%',
        width: '98%'
    },
    animate: {
        height: '100%',
        width: '100%'
    },
    exit: {
        height: '80%',
        width: '80%',
        transition: {
            duration: 0.15,
            ease: 'easeOut'
        }
    }
};
