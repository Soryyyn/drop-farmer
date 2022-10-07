import React from "react";
import styles from "../styles/SettingsItemButton.module.scss";
import SettingsItemDisabledBanner from "./SettingsItemDisabledBanner";

interface Props {
    label: string,
    disabled: boolean,
    description: string,
    buttonLabel: string,
    onClick: () => void
}

/**
 * A settings item component to display a setting for a farm or application.
 *
 * @param {string} label The label to display for the setting.
 * @param {boolean} disabled If the setting is disabled or not.
 * @param {string} description The description of the settings item.
 */
export default function SettingsItemButton({ label, disabled, description, buttonLabel, onClick }: Props) {
    return (
        <div className={styles.container}>
            {disabled &&
                <SettingsItemDisabledBanner />
            }
            <label>{label}</label>
            <button
                className={styles.button}
                onClick={onClick}
            >{buttonLabel}</button>
            <p className={styles.desc}>{description}</p>
        </div>
    );
}