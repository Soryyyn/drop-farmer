import React from "react";
import Switch from "react-switch";
import styles from "../styles/SettingsItemToggle.module.scss";
import SettingsItemDisabledBanner from "./SettingsItemDisabledBanner";

interface Props {
    label: string,
    checked: boolean,
    onClick: (checked: boolean) => void,
    disabled: boolean,
    description: string
}

/**
 * A settings item component to display a setting for a farm or application.
 *
 * @param {string} label The label to display for the setting.
 * @param {boolean} checked The current status of the toggle switch.
 * @param {void} onClick The function which gets called when the switch is clicked.
 * @param {boolean} disabled If the setting is disabled or not.
 * @param {string} description The description of the settings item.
 */
export default function SettingsItemToggle({ label, checked, onClick, disabled, description }: Props) {
    return (
        <div className={styles.container}>
            {disabled &&
                <SettingsItemDisabledBanner />
            }
            <label>{label}</label>
            <Switch
                onChange={(checked: boolean) => {
                    onClick(checked);
                }}
                checked={checked}
                disabled={disabled}
                checkedIcon={false}
                uncheckedIcon={false}
                height={25}
                width={47}
                handleDiameter={17}
                offColor="#0c0e16"
                onColor="#ff0044"
                className="toggle-item"
                borderRadius={6}
            />
            <p className={styles.desc}>{description}</p>
        </div>
    );
}