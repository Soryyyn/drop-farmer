import {
    faRotate,
    faShield,
    faStar,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import styles from '../styles/FarmItem.module.scss';
import DisplayWindowsButton from './DisplayWindowsButton';
import ExtraButton from './ExtraButton';
import IndicatorTag from './IndicatorTag';

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmItem({ name, type, status }: SidebarFarmItem) {
    /**
     * If the farming windows are being shown.
     * Show open eye when showing else strikedthrough eye.
     */
    const [showingWindows, setShowingWindows] = useState<boolean>(false);

    return (
        <div className={styles.container}>
            <div className={styles.firstRow}>
                <div className={styles.left}>
                    <div className={styles.titleRow}>
                        {type == 'default' ? (
                            <FontAwesomeIcon
                                icon={faShield}
                                className={styles.typeIcon}
                                size="1x"
                                fixedWidth={true}
                            />
                        ) : (
                            <FontAwesomeIcon
                                icon={faStar}
                                className={styles.typeIcon}
                                size="1x"
                                fixedWidth={true}
                            />
                        )}
                        <p className={styles.title}>{name}</p>
                    </div>
                    <div className={styles.details}>
                        <IndicatorTag status={status} />
                        {status !== 'disabled' && (
                            <div className={styles.extraButtons}>
                                <ExtraButton
                                    icon={faRotate}
                                    text="Restart farm"
                                    onClickAction={() => {
                                        window.api.log(
                                            'DEBUG',
                                            `Clicked restart farm button on "${name}"`
                                        );
                                        window.api.sendOneWay(
                                            window.api.channels
                                                .restartScheduler,
                                            name
                                        );
                                    }}
                                />
                                <ExtraButton
                                    icon={faTrash}
                                    text="Clear cache of the farm. User login is required again after clearing."
                                    onClickAction={() => {
                                        window.api.log(
                                            'DEBUG',
                                            `Clicked button to clear cache on "${name}"`
                                        );
                                        window.api.sendOneWay(
                                            window.api.channels.clearCache,
                                            name
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <DisplayWindowsButton
                    showing={showingWindows}
                    handleChange={(showing: boolean) => {
                        /**
                         * Only react if there are actual windows.
                         */
                        if (
                            status === 'checking' ||
                            status === 'farming' ||
                            status === 'attention-required'
                        ) {
                            window.api.log(
                                'DEBUG',
                                `Clicked "eye"-icon on "${name}", setting to "${showing}"`
                            );
                            setShowingWindows(showing);

                            /**
                             * When the eye symbol is pressed and the windows should be showed or hidden.
                             */
                            window.api.sendOneWay(
                                window.api.channels.farmWindowsVisibility,
                                {
                                    name: name,
                                    showing: showing
                                }
                            );
                        }
                    }}
                />
            </div>
            {/* {
                (status === "attention-required" || showingActionButtons) &&
                <div className={styles.secondRow}>
                    <FarmActionButton
                        label="Clear cache"
                        handleClick={() => {
                            window.api.log("DEBUG", `Clicked button to reset clear cache on \"${name}\"`);
                            window.api.sendOneWay(window.api.channels.clearCache, (name));
                        }}
                    />
                    <FarmActionButton
                        label="Restart Farm"
                        handleClick={() => {
                            window.api.log("DEBUG", `Clicked restart farm button on \"${name}\"`);
                            window.api.sendOneWay(window.api.channels.restartScheduler, (name));
                        }}
                    />
                </div>
            }
            <FontAwesomeIcon
                icon={(showingActionButtons || status === "attention-required") ? faAngleUp : faAngleDown}
                size="1x"
                className={styles.arrowShowActionButton}
                onClick={() => setShowingActionButtons(!showingActionButtons)}
            /> */}
        </div>
    );
}
