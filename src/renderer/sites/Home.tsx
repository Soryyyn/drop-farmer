import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faGear, faGlobe, faPowerOff, faReceipt } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonNolabel from "../components/ButtonNoLabel";
import ModelAnimation from "../components/ModelAnimation";
import Sidebar from "../components/Sidebar";
import styles from "../styles/Home.module.scss";

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
            window.api.removeAllListeners(window.api.channels.getApplicationVersion);
        };
    }, []);

    return (
        <div className={styles.divider}>
            <Sidebar />
            <div className={styles.mainContainer}>
                <div className={styles.content}>
                    <ModelAnimation
                        animationDisabled={animationsDisabled}
                        animationSrc="../assets/crate-falling.webm"
                    />
                    <h1 className={styles.title}>DROP-FARMER</h1>
                    <p className={styles.desc}>Stream drops farmer application</p>
                    <div className={styles.buttonsContainer}>
                        <ButtonNolabel
                            icon={faGithub}
                            primary={true}
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn/drop-farmer");
                            }}
                        />
                        <ButtonNolabel
                            icon={faGlobe}
                            primary={true}
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://soryn.dev");
                            }}
                        />
                        <ButtonNolabel
                            icon={faReceipt}
                            primary={true}
                            onClickAction={() => { }}
                        />
                        <ButtonNolabel
                            icon={faGear}
                            primary={true}
                            onClickAction={() => {
                                navigation("/settings");
                            }}
                        />
                        <ButtonNolabel
                            icon={faPowerOff}
                            primary={true}
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.shutdown);
                            }}
                        />
                    </div>
                    <div className={styles.additionalData}>
                        <p>Version: {applicationVersion}</p>
                        <p>Copyright © Soryn</p>
                        <p>Internet connection: {(internetConnection) ? "Connected" : "No internet"}</p>
                    </div>
                </div>
            </div>
        </div>

    );
}