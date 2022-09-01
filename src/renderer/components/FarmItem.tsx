import React, { useState } from "react";
import styles from "../styles/FarmItem.module.scss";
import DisplayWindowsButton from "./DisplayWindowsButton";
import FarmActionButton from "./FarmActionButton";
import IndicatorTag from "./IndicatorTag";

interface Props {
    farm: FarmRendererObject,
    status: FarmStatus
}

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmItem({ farm, status }: Props) {
    /**
     * If the farming windows are being shown.
     * Show open eye when showing else strikedthrough eye.
     */
    const [showingWindows, setShowingWindows] = useState<boolean>(false);

    return (
        <div className={styles.container}>
            <div className={styles.firstRow}>
                <div className={styles.left}>
                    <p>{farm.gameName}</p>
                    <IndicatorTag status={status} />
                </div>
                <DisplayWindowsButton
                    showing={showingWindows}
                    handleChange={(showing: boolean) => {
                        /**
                         * Only react if there are actual windows.
                         */
                        if (status === "checking" || status === "farming" || status === "attention-required") {
                            window.api.log("INFO", `Clicked \"eye\"-icon on \"${farm.gameName}\", setting to \"${showing}\"`);
                            setShowingWindows(showing);

                            /**
                             * When the eye symbol is pressed and the windows should be showed or hidden.
                             */
                            window.api.sendOneWay(window.api.channels.farmWindowsVisibility, {
                                farm: farm,
                                show: showing
                            });
                        }
                    }}
                />
            </div>
            {
                (status === "attention-required") &&
                <div className={styles.secondRow}>
                    <FarmActionButton
                        label="Clear cache"
                        handleClick={() => {
                            window.api.log("INFO", `Clicked button to reset clear cache on \"${farm.gameName}\"`);
                            window.api.sendOneWay(window.api.channels.clearCache, (farm.gameName));
                        }}
                    />
                    <FarmActionButton
                        label="Restart Farm"
                        handleClick={() => {
                            window.api.log("INFO", `Clicked restart farm button on \"${farm.gameName}\"`);
                            window.api.sendOneWay(window.api.channels.restartScheduler, (farm.gameName));
                        }}
                    />
                </div>
            }
        </div>
    );
}