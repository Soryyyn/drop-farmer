import React, { useEffect, useState } from "react";
import ExtraButton from "../components/ExtraButton";
import Sidebar from "../components/Sidebar";

export default function Home() {
    const [internetConnection, setInternetConnection] = useState<boolean>(true);

    /**
     * On site load, get internet connection
     */
    useEffect(() => {
        window.api.sendAndWait(window.api.channels.getInternetConnection)
            .then((connection: any) => {
                setInternetConnection(connection);
            })
            .catch((err) => {
                console.log(err);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getInternetConnection)
        };
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
                            window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn/drop-farmer");
                        }} />
                        <ExtraButton imgPath="../assets/web.svg" onClick={() => {
                            window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://soryn.dev");
                        }} />
                        <ExtraButton imgPath="../assets/statistics.svg" onClick={() => { }} />
                        <ExtraButton imgPath="../assets/gear.svg" onClick={() => { }} />
                    </div>
                    <p id="made-by">Copyright © Soryn</p>
                    <p id="internet-connection">Internet connection: {(internetConnection) ? "Connected" : "No internet"}</p>
                </div>
            </div>
        </div>
    );
}