import Menu from "@components/global/Menu";
import { Alignment } from "@components/global/Menu/types";
import Modal from "@components/global/Modal";
import Tooltip from "@components/global/Tooltip";
import Settings from "@components/Settings";
import {
    faBars,
    faColonSign,
    faEllipsis,
    faGear,
    faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import ButtonDropdown from "../ButtonDropdown";
import ButtonNolabel from "../ButtonNoLabel";
import ModalManager from "../ModalManager";
import ModelAnimation from "../ModelAnimation";
import Sidebar from "../Sidebar";
// import styles from "./index.module.scss";

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
            <div className="flex flex-row h-full gap-8">
                <Sidebar />
                <div className="flex grow justify-center items-center !min-w-[60%]">
                    <div className="flex flex-col">
                        {/* <Menu
                            button={{
                                className: "p-4 bg-red-400",
                                element: (
                                    <FontAwesomeIcon
                                        icon={faEllipsis}
                                        size="1x"
                                        fixedWidth={true}
                                    />
                                )
                            }}
                            alignment={Alignment.BottomLeft}
                            entries={[
                                {
                                    label: "Entry 1",
                                    onClick: () => {}
                                },
                                {
                                    label: "Entry 2",
                                    onClick: () => {}
                                },
                                {
                                    label: "Entry 3",
                                    onClick: () => {}
                                }
                            ]}
                        /> */}
                        <ModelAnimation
                            animationDisabled={animationsDisabled}
                            animationSrc="../assets/crate-falling.webm"
                        />
                        <h1 className="-mt-5 text-center font-bold text-5xl text-[#181a29]">
                            DROP-FARMER
                        </h1>
                        <p className="text-center text-[#181a29] text-xl">
                            Stream drops farmer application
                        </p>
                        <div className="mt-8 flex items-center justify-center">
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
                        <div className="mt-4 flex flex-col items-center">
                            <p className="w-fit text-[#181a2980] text-center mt-1">
                                Version: {applicationVersion}
                            </p>
                            <p className="w-fit text-[#181a2980] text-center mt-1">
                                Copyright © Soryn
                            </p>
                            {/* {updateAvailable && ( */}
                            <Tooltip
                                placement="top"
                                tooltipText="Will get installed on restart"
                            >
                                <p
                                    // className={styles.installUpdate}
                                    onClick={() => {
                                        window.api.sendOneWay(
                                            window.api.channels.installUpdate
                                        );
                                    }}
                                >
                                    Update available! Click here to update
                                    <br />
                                </p>
                            </Tooltip>
                            {/* )} */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
