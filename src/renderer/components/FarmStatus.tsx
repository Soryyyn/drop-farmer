import React, { useState } from "react";

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmStatus({ farm, status }: {
    farm: Farm,
    status: FarmStatus
}) {
    const [showingWindows, setShowingWindows] = useState<boolean>(false);

    return (
        <div id="farm-status-container">
            <div id="farm-status-main">
                <div className="farm-status" id={`farm-${farm.id}`}>
                    <p>{farm.name}</p>
                </div>
                <div id="indicator-container">
                    <div
                        className="farm-status-indicator"
                        id={`indicator-${status}`}
                    ></div>
                    <p>{status}</p>
                </div>
            </div>
            <div
                id="farms-status-side"
                onClick={() => setShowingWindows(!showingWindows)}
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