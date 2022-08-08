import React from "react";
import ExtraButton from "../components/ExtraButton";
import FarmStatus from "../components/FarmStatus";
import Sidebar from "../components/Sidebar";

export default function Home() {
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
                    <p id="made-by">copyright © soryn</p>
                </div>
            </div>
        </div>
    );
}