import React from 'react';
import styles from '../styles/ModelAnimation.module.scss';

interface Props {
    animationSrc: string;
    animationDisabled: boolean;
}

export default function ModelAnimation({
    animationSrc,
    animationDisabled
}: Props) {
    if (animationDisabled)
        return (
            <video className={styles.video} loop>
                <source src={animationSrc} type="video/webm" />
            </video>
        );
    else
        return (
            <video className={styles.video} autoPlay loop>
                <source src={animationSrc} type="video/webm" />
            </video>
        );
}
