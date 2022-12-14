import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React from 'react';
import styles from '../styles/ButtonLabel.module.scss';

interface Props {
    icon: IconDefinition;
    primary: boolean;
    label: string;
    onClickAction: () => void;
}

export default function ButtonLabel({
    icon,
    primary,
    label,
    onClickAction
}: Props) {
    return (
        <div
            className={clsx(
                styles.buttonContainer,
                primary ? styles.primary : styles.secondary
            )}
            onClick={onClickAction}
        >
            <FontAwesomeIcon icon={icon} size="lg" className={styles.icon} />
            <p>{label}</p>
        </div>
    );
}
