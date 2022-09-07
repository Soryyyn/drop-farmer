import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "../styles/FarmItem.module.scss";
import DisplayWindowsButton from "./DisplayWindowsButton";
import FarmActionButton from "./FarmActionButton";
import IndicatorTag from "./IndicatorTag";

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmItem({ name, status }: newFarmRendererObject) {
    /**
     * If the farming windows are being shown.
     * Show open eye when showing else strikedthrough eye.
     */
    const [showingWindows, setShowingWindows] = useState<boolean>(false);

    /**
     * If the farm action button should be shown.
     */
    const [showingActionButtons, setShowingActionButtons] = useState<boolean>(false);

    return (
        <div className={styles.container}>
            <div className={styles.firstRow}>
                <div className={styles.left}>
                    <p>{name}</p>
                    <IndicatorTag status={status} />
                </div>
                <DisplayWindowsButton
                    showing={showingWindows}
                    handleChange={(showing: boolean) => {
                        /**
                         * Only react if there are actual windows.
                         */
                        if (status === "checking" || status === "farming" || status === "attention-required") {
                            window.api.log("INFO", `Clicked \"eye\"-icon on \"${name}\", setting to \"${showing}\"`);
                            setShowingWindows(showing);

                            /**
                             * When the eye symbol is pressed and the windows should be showed or hidden.
                             */
                            window.api.sendOneWay(window.api.channels.farmWindowsVisibility, {
                                name: name,
                                showing: showing
                            });
                        }
                    }}
                />
            </div>
            {
                (status === "attention-required" || showingActionButtons) &&
                <div className={styles.secondRow}>
                    <FarmActionButton
                        label="Clear cache"
                        handleClick={() => {
                            window.api.log("INFO", `Clicked button to reset clear cache on \"${name}\"`);
                            window.api.sendOneWay(window.api.channels.clearCache, (name));
                        }}
                    />
                    <FarmActionButton
                        label="Restart Farm"
                        handleClick={() => {
                            window.api.log("INFO", `Clicked restart farm button on \"${name}\"`);
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
            />
        </div>
    );
}