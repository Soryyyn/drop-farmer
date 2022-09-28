import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faBars, faGear, faGlobe, faPowerOff, faReceipt } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonDropdown from "../components/ButtonDropdown";
import ButtonNolabel from "../components/ButtonNoLabel";
import DropdownItem from "../components/DropdownItem";
import ModelAnimation from "../components/ModelAnimation";
import Sidebar from "../components/Sidebar";
import Tooltip from "../components/Tooltip";
import styles from "../styles/Home.module.scss";
import { useHandleOneWay } from "../util/hooks/useHandleOneWay";

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
     * If a update is available.
     */
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

    /**
     * Get the navigation from react router
     * to make navigation on button click possible.
     */
    const navigation = useNavigate();

    /**
     * On site load, get internet connection
     */
    useEffect(() => {
        window.api.log("DEBUG", "Rendering home page")

        /**
         * Current internet connection listener.
         */
        window.api.handleOneWay(window.api.channels.internetChange, (event, connection) => {
            setInternetConnection(connection);
        });

        /**
         * Update available listener
         */
        window.api.handleOneWay(window.api.channels.updateAvailable, () => {
            setUpdateAvailable(true);
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
            window.api.removeAllListeners(window.api.channels.internetChange);
            window.api.removeAllListeners(window.api.channels.updateAvailable);
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
                        <ButtonDropdown
                            icon={faBars}
                            primary={true}
                            tooltipText="More options"
                        >
                            <DropdownItem
                                label={"Check for update"}
                                disabled={false}
                                action={() => {
                                    window.api.sendOneWay(window.api.channels.updateCheck);
                                }}
                            />
                            <DropdownItem
                                label={"About"}
                                disabled={true}
                                action={() => { }}
                            />
                            <DropdownItem
                                label={"Statistics"}
                                disabled={true}
                                action={() => { }}
                            />
                            <DropdownItem
                                label={"Restart application"}
                                disabled={false}
                                action={() => {
                                    window.api.sendOneWay(window.api.channels.restart);
                                }}
                            />
                            <DropdownItem
                                label={"Quit application"}
                                disabled={false}
                                action={() => {
                                    window.api.sendOneWay(window.api.channels.shutdown);
                                }}
                            />
                        </ButtonDropdown>
                        <ButtonNolabel
                            icon={faGlobe}
                            primary={true}
                            tooltipText="Website"
                            onClickAction={() => {
                                window.api.sendOneWay(window.api.channels.openLinkInExternal, "https://drop-farmer.soryn.dev");
                            }}
                        />
                        <ButtonNolabel
                            icon={faGear}
                            primary={true}
                            tooltipText="Settings"
                            onClickAction={() => {
                                navigation("/settings");
                            }}
                        />
                    </div>
                    <div className={styles.additionalData}>
                        <p>Version: {applicationVersion}</p>
                        <p>Copyright © Soryn</p>
                        <p>Internet connection: {(internetConnection) ? "Connected" : "No internet"}</p>
                        {updateAvailable &&
                            <Tooltip
                                placement="top"
                                tooltipText="Will get installed on restart"
                            >
                                <p
                                    className={styles.installUpdate}
                                    onClick={() => {
                                        window.api.sendOneWay(window.api.channels.installUpdate);
                                    }}
                                >
                                    Update available! Click here to update<br />
                                </p>
                            </Tooltip>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}