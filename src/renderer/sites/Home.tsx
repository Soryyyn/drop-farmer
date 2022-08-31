import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonNolabel from "../components/ButtonNoLabel";
import ExtraButton from "../components/ExtraButton";
import Sidebar from "../components/Sidebar";

/**
 * The route for the main page of the application.
 */
export default function Home() {
    /**
     * If the application has a internet connection.
     */
    const [internetConnection, setInternetConnection] = useState<boolean>(true);

    /**
     * If the 3d-animations are disabled or not.
     */
    const [animationsDisabled, setAnimationsDisabled] = useState<boolean>(false);

    /**
     * The application version.
     */
    const [applicationVersion, setApplicationVersion] = useState<string>("0.0.0");

    /**
     * Get the navigation from react router
     * to make navigation on button click possible.
     */
    const navigation = useNavigate();

    /**
     * On site load, get internet connection
     */
    useEffect(() => {
        window.api.log("INFO", "Rendering home page")

        /**
         * Current internet connection.
         */
        window.api.sendAndWait(window.api.channels.getInternetConnection)
            .then((connection: any) => {
                setInternetConnection(connection);
            })
            .catch((err) => {
                window.api.log("ERROR", `Error when setting internet connection. ${err}`);
            });

        /**
         * 3D-Animations disabled?
         */
        window.api.sendAndWait(window.api.channels.get3DAnimationsDisabled)
            .then((disabled: any) => {
                setAnimationsDisabled(disabled);
            })
            .catch((err) => {
                window.api.log("ERROR", `Error when setting animations status. ${err}`);
            });

        /**
         * Application version.
         */
        window.api.sendAndWait(window.api.channels.getApplicationVersion)
            .then((version: any) => {
                setApplicationVersion(version);
            })
            .catch((err) => {
                window.api.log("ERROR", `Error when setting application version. ${err}`);
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.getInternetConnection);
            window.api.removeAllListeners(window.api.channels.get3DAnimationsEnabled);
        };
    }, []);

    return (
        <div id="home-divider">
            <Sidebar />
            <div id="home-container">
                <div id="home-content">
                    {(animationsDisabled)
                        ? <video loop>
                            <source src="../assets/crate-falling.webm" type="video/webm" />
                        </video>
                        : <video autoPlay loop>
                            <source src="../assets/crate-falling.webm" type="video/webm" />
                        </video>
                    }
                    <h1 id="home-title">DROP-FARMER</h1>
                    <p id="home-desc">Stream drops farmer application</p>
                    <div id="home-extra">
                        <ButtonNolabel
                            imgPath="../assets/github.svg"
                            primary={true}
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn/drop-farmer");
                            }}
                        />
                        <ButtonNolabel
                            imgPath="../assets/web.svg"
                            primary={true}
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://soryn.dev");
                            }}
                        />
                        <ButtonNolabel
                            imgPath="../assets/statistics.svg"
                            primary={true}
                            onClickAction={() => { }}
                        />
                        <ButtonNolabel
                            imgPath="../assets/gear.svg"
                            primary={true}
                            onClickAction={() => {
                                navigation("/settings");
                            }}
                        />
                    </div>
                    <p id="application-version">Version: {applicationVersion}</p>
                    <p id="made-by">Copyright © Soryn</p>
                    <p id="internet-connection">Internet connection: {(internetConnection) ? "Connected" : "No internet"}</p>
                </div>
            </div>
        </div>

    );
}