import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useSendAndWait } from "../../util/hooks";
import styles from "./Settings.module.scss";

export default function Settings() {
    const [currentlySelected, setCurrentlySelected] = useState<number>(0);
    const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings>();
    const [farmSettings, setFarmSettings] = useState<FarmSaveData[]>([]);

    /**
     * Get the settings file data from main process.
     */
    useSendAndWait(window.api.channels.getSettings, null, (err, response) => {
        if (!err) {
            setApplicationSettings(response.applicationSettings);
            setFarmSettings(response.farmSettings);
        }
    });

    return (
        <>
            {applicationSettings && farmSettings &&
                <div className={styles.splitterContainer}>
                    <ul className={styles.settingsSelectors}>
                        <li
                            className={clsx(styles.selector, (currentlySelected === 0) ? styles.selectorSelected : null)}
                            key="application"
                            onClick={() => {
                                setCurrentlySelected(0);
                            }}
                        >application</li>
                        <li className={styles.seperator}></li>
                        {
                            farmSettings.map((farmSetting, index) => {
                                return <li
                                    className={clsx(styles.selector, (currentlySelected === index + 1) ? styles.selectorSelected : null)}
                                    key={farmSetting.name}
                                    onClick={() => {
                                        /**
                                         * The index is increased by one here to
                                         * include the 0 of the application settings.
                                         */
                                        setCurrentlySelected(index + 1);
                                    }}
                                >{farmSetting.name}</li>
                            })
                        }
                    </ul>
                    <ul className={styles.settingsItems}>
                        <p>{currentlySelected}</p>
                    </ul>
                </div>
            }
        </>
    );
}