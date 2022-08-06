import React, { useEffect, useState } from "react";
import FarmStatus from "./FarmStatus";

export default function Sidebar() {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [farmsStatus, setFarmsStatus] = useState<FarmStatusObject[]>([]);

    /**
     * On site load, get all farms from main process and display the enabled ones.
     */
    useEffect(() => {
        window.api.sendAndWait(window.api.channels.getFarms)
            .then((data: any) => {
                setFarms(data.farms);
                setFarmsStatus(data.farmsStatus);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    /**
     * Handle the call from main when the farms are being checked for farming.
     *
     * - Check if the changed status of farm is the current one, if not ignore.
     * - If it is this one, then change the status.
     */
    useEffect(() => {
        window.api.handleOneWay(window.api.channels.farmStatusChange, (event: Electron.IpcRendererEvent, newFarmStatus: FarmStatusObject) => {

            /**
             * Create empty array for the state.
             */
            let tempState: FarmStatusObject[] = [];

            /**
             * Check which farm had a status change.
             */
            for (let i = 0; i < farms.length; i++) {
                if (farms[i].id === newFarmStatus.id) {

                    /**
                     * Clear the temporary state to apply latest changes to states.
                     */
                    tempState = [];
                    tempState = [...farmsStatus];
                    let changed: FarmStatusObject = {
                        ...newFarmStatus
                    }

                    tempState[i] = changed;
                }
            }

            /**
             * Set the state after going through each farm.
             */
            setFarmsStatus(tempState);
        });

        return () => {
            window.api.removeAllListeners(window.api.channels.farmStatusChange)
        };
    }, [farmsStatus])

    return (
        <div id="sidebar">
            <ul>
                {
                    farms && farms.map((farm: Farm) => {
                        return <FarmStatus
                            key={farm.id}
                            farm={farm}
                            status={farmsStatus[farm.id].status}
                        />
                    })
                }
            </ul>
        </div>
    );
}