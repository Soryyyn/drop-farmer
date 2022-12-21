import {
    faFloppyDisk,
    faRotateRight,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSendAndWait } from '@hooks/useSendAndWait';
import clsx from 'clsx';
import { cloneDeep, isEqual } from 'lodash';
import React, { useState } from 'react';
import SettingItem from './SettingItem';
import styles from './Settings.module.scss';

interface Props {
    handleClosing: () => void;
}

export default function Settings({ handleClosing }: Props) {
    const [currentlySelected, setCurrentlySelected] =
        useState<string>('application');
    const [selectors, setSelectors] = useState<string[]>([]);
    const [settings, setSettings] = useState<Settings>();

    /**
     * We keep an original settings here to compare with after changes if
     * calling a save is actually necessary.
     */
    const [originalSettings, setOriginalSettings] = useState<Settings>();

    /**
     * Get the settings file data from main process.
     */
    useSendAndWait(api.channels.getSettings, null, (err, response) => {
        if (!err) {
            setSelectors(Object.keys(response));
            setSettings(response);
            setOriginalSettings(cloneDeep(response));
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <button
                    key="resetSettingsToDefault"
                    onClick={() => {
                        const copy = cloneDeep(settings!);

                        /**
                         * Go through each setting and reset it to the default.
                         */
                        for (const [key] of Object.entries(copy)) {
                            for (const [
                                setting,
                                settingValues
                            ] of Object.entries(copy[key])) {
                                settingValues.value =
                                    settingValues.defaultValue;
                            }
                        }

                        setSettings(copy);

                        /**
                         * Save the reset.
                         */
                        api.sendOneWay(api.channels.saveNewSettings, settings);
                        setOriginalSettings(cloneDeep(settings));
                    }}
                    className={styles.topBarButton}
                >
                    <FontAwesomeIcon
                        icon={faRotateRight}
                        size="lg"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                </button>
                <button
                    key="savingButton"
                    onClick={() => {
                        /**
                         * Only send the ipc signal if changing is needed.
                         */
                        if (!isEqual(settings, originalSettings)) {
                            api.sendOneWay(
                                api.channels.saveNewSettings,
                                settings
                            );
                            setOriginalSettings(cloneDeep(settings));
                        }
                    }}
                    className={styles.topBarButton}
                >
                    <FontAwesomeIcon
                        icon={faFloppyDisk}
                        size="lg"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                </button>
                <button
                    key="closingButton"
                    onClick={handleClosing}
                    className={styles.topBarButton}
                >
                    <FontAwesomeIcon
                        icon={faXmark}
                        size="lg"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                </button>
            </div>
            {selectors && settings && (
                <div className={styles.splitterContainer}>
                    <ul className={styles.settingsSelectors}>
                        {selectors.map((selector) => {
                            return (
                                <li
                                    className={clsx(
                                        styles.selector,
                                        currentlySelected === selector
                                            ? styles.selectorSelected
                                            : null
                                    )}
                                    key={selector}
                                    onClick={() => {
                                        setCurrentlySelected(selector);
                                    }}
                                >
                                    {selector}
                                </li>
                            );
                        })}
                    </ul>
                    <ul className={styles.settingsItems}>
                        {settings[currentlySelected].map((setting) => {
                            return (
                                <SettingItem
                                    key={setting.name}
                                    setting={setting}
                                    onChanged={(value: any) => {
                                        /**
                                         * Apply the changed setting to a copy
                                         * of the settings.
                                         * Then set the settings as the just
                                         * changed copy.
                                         */
                                        const copyOfSettings = { ...settings };
                                        const newFarmSetting = { ...setting };

                                        copyOfSettings[
                                            currentlySelected
                                        ].forEach((s) => {
                                            if (
                                                newFarmSetting.name === s.name
                                            ) {
                                                s.value = value;
                                                s = newFarmSetting;
                                            }
                                        });

                                        setSettings(copyOfSettings);
                                    }}
                                />
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
