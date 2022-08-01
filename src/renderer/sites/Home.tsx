import React, { useEffect, useState } from "react";
import FarmStatus from "../components/FarmStatus";
import SocialButton from "../components/SocialButton";

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
            <div id="home-farms-status">
                {farms.length > 0
                    ? <ul>
                        {
                            farms.map((farm: Farm) => {
                                return <FarmStatus
                                    key={farm.id}
                                    farm={farm}
                                />
                            })
                        }
                    </ul>
                    : <p>no farms</p>
                }
            </div>
            <div id="home-container">
                <div id="home-content">
                    <video autoPlay loop>
                        <source src="../assets/crate-falling.webm" type="video/webm" />
                    </video>
                    <h1 id="home-title">DROP-FARMER</h1>
                    <p id="home-desc">Stream drops farmer application</p>
                    <div id="home-socials">
                        <SocialButton imgPath="../assets/github.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn");
                        }} />
                        <SocialButton imgPath="../assets/web.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://soryn.dev");
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}