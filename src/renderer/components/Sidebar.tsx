import React, { useEffect, useState } from "react";
import FarmStatus from "./FarmStatus";

export default function Sidebar() {
    const [farms, setFarms] = useState<Farm[]>([]);

    /**
     * On site load, get all farms from main process and display the enabled ones.
     */
    useEffect(() => {
        window.api.callMain(window.api.channels.getFarms)
            .then((farmsFromMain: any) => {
                setFarms(farmsFromMain);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <div id="sidebar">
            <ul>
                {
                    farms.map((farm: Farm) => {
                        return <FarmStatus
                            key={farm.id}
                            farm={farm}
                        />
                    })
                }
            </ul>
        </div>
    );
}