import React, { useState } from "react";

/**
 * Farms status display for the home page to inform the user of all enabled farms.
 *
 * @param {Object} props Farm to show the status of.
 */
export default function FarmStatus({ farm }: {
    farm: Farm
}) {
    const [status, setStatus] = useState<"running" | "waiting" | "disabled">("waiting");

    return (
        <div id="farm-status-divider">
            <div className="farm-status" id={`farm-${farm.id}`}>
                <p>{farm.name}</p>
            </div>
            <div
                className="farm-status-indicator"
                id={`indicator-${status}`}
            ></div>
        </div >

    );
}