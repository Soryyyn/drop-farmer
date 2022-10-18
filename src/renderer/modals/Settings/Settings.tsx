import { faFloppyDisk, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSendAndWait } from "../../util/hooks";
import SettingItem from "./SettingItem";
import styles from "./Settings.module.scss";

interface Props {
    handleClosing: () => void
}

export default function Settings({ handleClosing }: Props) {
    const [currentlySelected, setCurrentlySelected] = useState<string>("application");
    const [selectors, setSelectors] = useState<string[]>([]);
    const [settings, setSettings] = useState<Settings>();

    /**
     * Get the settings file data from main process.
     */
    useSendAndWait(window.api.channels.getSettings, null, (err, response) => {
        if (!err) {
            setSelectors(Object.keys(response));
            setSettings(response);
        }
    });

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <button
                    key="savingButton"
                    onClick={() => {
                        console.log("saving...");
                        handleClosing();
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
            {selectors && settings &&
                <div className={styles.splitterContainer}>
                    <ul className={styles.settingsSelectors}>
                        {
                            selectors.map((selector) => {
                                return <li
                                    className={clsx(styles.selector, (currentlySelected === selector) ? styles.selectorSelected : null)}
                                    key={selector}
                                    onClick={() => {
                                        setCurrentlySelected(selector);
                                    }}
                                >{selector}</li>
                            })
                        }
                    </ul>
                    <ul className={styles.settingsItems}>
                        {
                            settings[currentlySelected].map((setting) => {
                                return <SettingItem
                                    key={setting.name}
                                    setting={setting}
                                    onChanged={(value: any) => {
                                        /**
                                         * Apply the changed setting to a copy
                                         * of the settings.
                                         * Then set the settings as the just
                                         * changed copy.
                                         */
                                        let copyOfSettings = { ...settings };
                                        let newFarmSetting = { ...setting };

                                        copyOfSettings[currentlySelected].forEach((s) => {
                                            if (newFarmSetting.name === s.name) {
                                                s.value = value;
                                                s = newFarmSetting;
                                            }
                                        });

                                        setSettings(copyOfSettings);
                                    }}
                                />
                            })
                        }
                    </ul>
                </div>
            }
        </div>
    );
}