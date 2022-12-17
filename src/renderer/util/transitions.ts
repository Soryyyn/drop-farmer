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
        width: '95%',
        height: '95%'
    },
    animate: {
        width: '100%',
        height: '100%'
    },
    exit: {
        width: '90%',
        height: '90%',
        opacity: 0
    }
};
