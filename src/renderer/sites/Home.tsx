import React, { useEffect, useState } from "react";
import ExtraButton from "../components/ExtraButton";
import FarmStatus from "../components/FarmStatus";
import Sidebar from "../components/Sidebar";

export default function Home() {
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
        <div id="home-divider">
            <Sidebar />
            <div id="home-container">
                <div id="home-content">
                    <video autoPlay loop>
                        <source src="../assets/crate-falling.webm" type="video/webm" />
                    </video>
                    <h1 id="home-title">DROP-FARMER</h1>
                    <p id="home-desc">Stream drops farmer application</p>
                    <div id="home-extra">
                        <ExtraButton imgPath="../assets/github.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn");
                        }} />
                        <ExtraButton imgPath="../assets/web.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://soryn.dev");
                        }} />
                        <ExtraButton imgPath="../assets/statistics.svg" onClick={() => { }} />
                        <ExtraButton imgPath="../assets/gear.svg" onClick={() => { }} />
                    </div>
                </div>
            </div>
        </div>
    );
}