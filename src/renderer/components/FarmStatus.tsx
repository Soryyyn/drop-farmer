import React, { useState } from "react";
import IndicatorTag from "./IndicatorTag";

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmStatus({ farm, status }: {
    farm: FarmRendererObject,
    status: FarmStatus
}) {
    /**
     * If the farming windows are being shown.
     * Show open eye when showing else strikedthrough eye.
     */
    const [showingWindows, setShowingWindows] = useState<boolean>(false);

    return (
        <div id="farm-status-container">
            <div id="farm-status-main">
                <div className="farm-status" id={`farm-${farm.gameName}`}>
                    <p>{farm.gameName}</p>
                </div>
                <IndicatorTag status={status} />
            </div>
            <div
                id="farms-status-side"
                onClick={() => {
                    /**
                     * Only react if there are actual windows.
                     */
                    if (status === "checking" || status === "farming") {
                        window.api.log("INFO", `Clicked \"eye\"-icon on \"${farm.gameName}\", setting to \"${!showingWindows}\"`);
                        setShowingWindows(!showingWindows);

                        /**
                         * When the eye symbol is pressed and the windows should be showed or hidden.
                         */
                        window.api.sendOneWay(window.api.channels.farmWindowsVisibility, {
                            farm: farm,
                            show: !showingWindows
                        });
                    }
                }}
            >
                {
                    (showingWindows)
                        ? <img src="../assets/visible.svg" />
                        : <img src="../assets/invisible.svg" />
                }
            </div>
        </div >
    );
}