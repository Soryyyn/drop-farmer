import React from "react";
import styles from "../styles/SettingsItemInput.module.scss";
import SettingsItemDisabledBanner from "./SettingsItemDisabledBanner";

interface Props {
    label: string,
    disabled: boolean,
    description: string,
    value: string,
    onInput: (newValue: string) => any
}

/**
 * A settings item component to display a setting for a farm or application.
 *
 * @param {string} label The label to display for the setting.
 * @param {boolean} disabled If the setting is disabled or not.
 * @param {string} description The description of the settings item.
 */
export default function SettingsItemInput({ label, disabled, description, value, onInput }: Props) {
    return (
        <div className={styles.container}>
            {disabled &&
                <SettingsItemDisabledBanner />
            }
            <label>{label}</label>
            <input
                value={value}
                onInput={(event) => {
                    onInput(event.currentTarget.value);
                }}
                disabled={disabled}
            />
            <p className={styles.desc}>{description}</p>
        </div>
    );
}