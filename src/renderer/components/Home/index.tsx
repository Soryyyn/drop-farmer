import { faBars, faGear, faGlobe } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import ButtonDropdown from "../ButtonDropdown";
import ButtonNolabel from "../ButtonNoLabel";
import Tooltip from "../global/Tooltip";
import ModalManager from "../ModalManager";
import ModelAnimation from "../ModelAnimation";
import Sidebar from "../Sidebar";
import styles from "./index.module.scss";

/**
 * The route for the main page of the application.
 */
export default function Home() {
    const [animationsDisabled, setAnimationsDisabled] =
        useState<boolean>(false);
    const [applicationVersion, setApplicationVersion] =
        useState<string>("0.0.0");
    const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

    const [showingModal, setShowingModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<{
        modalToShow: "settings" | "add-new-farm";
    }>({
        modalToShow: "settings"
    });

    /**
     * On site load, get internet connection
     */
    useEffect(() => {
        window.api.log("DEBUG", "Rendering home page");

        /**
         * Update available listener
         */
        window.api.handleOneWay(window.api.channels.updateAvailable, () => {
            setUpdateAvailable(true);
        });

        /**
         * 3D-Animations disabled?
         */
        window.api
            .sendAndWait(window.api.channels.get3DAnimationsDisabled)
            .then((disabled: any) => {
                setAnimationsDisabled(disabled);
            })
            .catch((err) => {
                window.api.log(
                    "ERROR",
                    `Error when setting animations status. ${err}`
                );
            });

        /**
         * Application version.
         */
        window.api
            .sendAndWait(window.api.channels.getApplicationVersion)
            .then((version: any) => {
                setApplicationVersion(version);
            })
            .catch((err) => {
                window.api.log(
                    "ERROR",
                    `Error when setting application version. ${err}`
                );
            });

        return () => {
            window.api.removeAllListeners(window.api.channels.updateAvailable);
            window.api.removeAllListeners(
                window.api.channels.get3DAnimationsEnabled
            );
            window.api.removeAllListeners(
                window.api.channels.getApplicationVersion
            );
        };
    }, []);

    return (
        <>
            <ModalManager
                showing={showingModal}
                modalToShow={modalData.modalToShow}
                handleClosing={() => setShowingModal(false)}
            />
            <div className={styles.divider}>
                <Sidebar />
                <div className={styles.mainContainer}>
                    <div className={styles.content}>
                        <ModelAnimation
                            animationDisabled={animationsDisabled}
                            animationSrc="../assets/crate-falling.webm"
                        />
                        <h1 className={styles.title}>DROP-FARMER</h1>
                        <p className={styles.desc}>
                            Stream drops farmer application
                        </p>
                        <div className={styles.buttonsContainer}>
                            <ButtonDropdown
                                icon={faBars}
                                primary={true}
                                dropdownItems={[
                                    {
                                        type: "label",
                                        label: "Check for update",
                                        disabled:
                                            process.env.NODE_ENV !==
                                            "production",
                                        action() {
                                            window.api.sendOneWay(
                                                window.api.channels.updateCheck
                                            );
                                        }
                                    },
                                    {
                                        type: "seperator"
                                    },
                                    {
                                        type: "label",
                                        label: "About",
                                        disabled: true
                                    },
                                    {
                                        type: "label",
                                        label: "Statistics",
                                        disabled: true
                                    },
                                    {
                                        type: "seperator"
                                    },
                                    {
                                        type: "label",
                                        label: "Restart application",
                                        disabled: false,
                                        action() {
                                            window.api.sendOneWay(
                                                window.api.channels.restart
                                            );
                                        }
                                    },
                                    {
                                        type: "label",
                                        label: "Quit application",
                                        disabled: false,
                                        action() {
                                            window.api.sendOneWay(
                                                window.api.channels.shutdown
                                            );
                                        }
                                    }
                                ]}
                            />
                            <ButtonNolabel
                                icon={faGlobe}
                                primary={true}
                                tooltipText="Website"
                                onClickAction={() => {
                                    window.api.sendOneWay(
                                        window.api.channels.openLinkInExternal,
                                        "https://drop-farmer.soryn.dev"
                                    );
                                }}
                            />
                            <ButtonNolabel
                                icon={faGear}
                                primary={true}
                                tooltipText="Settings"
                                onClickAction={() => {
                                    setShowingModal(true);
                                    setModalData({
                                        modalToShow: "settings"
                                    });
                                }}
                            />
                        </div>
                        <div className={styles.additionalData}>
                            <p>Version: {applicationVersion}</p>
                            <p>Copyright © Soryn</p>
                            {updateAvailable && (
                                <Tooltip
                                    placement="top"
                                    tooltipText="Will get installed on restart"
                                >
                                    <p
                                        className={styles.installUpdate}
                                        onClick={() => {
                                            window.api.sendOneWay(
                                                window.api.channels
                                                    .installUpdate
                                            );
                                        }}
                                    >
                                        Update available! Click here to update
                                        <br />
                                    </p>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
