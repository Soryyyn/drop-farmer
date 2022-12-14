import { easings } from 'react-spring';

export const OpacityScaleTransition = {
    from: {
        opacity: 0,
        width: '90%',
        height: '90%'
    },
    enter: {
        opacity: 1,
        width: '100%',
        height: '100%'
    },
    leave: {
        opacity: 0,
        width: '90%',
        height: '90%'
    },
    config: {
        duration: 100,
        easing: easings.easeInOutQuad
    }
};
