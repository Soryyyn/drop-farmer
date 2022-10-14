import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect } from "react";
import { animated, easings, useTransition } from "react-spring";
import Settings from "../modals/Settings/Settings";
import styles from "../styles/ModalManager.module.scss";

interface Props {
    modalToShow: "settings" | "add-new-farm";
    showing: boolean;
    handleClosing: () => void
}

export default function ModalManager({ modalToShow, showing, handleClosing }: Props) {
    useEffect(() => {
        if (showing)
            window.api.log("DEBUG", `Main modal showing ${modalToShow}`);
    }, [showing]);

    /**
     * The callback to control which modal to show depending on the
     * `modalToShow` prop.
     */
    const modal = useCallback(() => {
        if (modalToShow === "settings") {
            return <Settings />
        } else if (modalToShow === "add-new-farm") {
            return <p>add new farm</p>
        }
    }, [modalToShow]);

    /**
     * The animation for animation the mounting of the modal manager component.
     */
    const mountTransition = useTransition(showing, {
        from: {
            opacity: 0,
            width: "90%",
            height: "90%",
        },
        enter: {
            opacity: 1,
            width: "100%",
            height: "100%",
        },
        leave: {
            opacity: 0,
            width: "90%",
            height: "90%",
        },
        config: {
            duration: 100,
            easing: easings.easeInOutQuad
        }
    });

    /**
     * Animate mounting of modal.
     */
    return mountTransition((extraStyles, item) => item &&
        <animated.div style={extraStyles} className={styles.bgFilter}>
            <div className={styles.container}>
                <button
                    onClick={handleClosing}
                    className={styles.closeModalButton}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" className={styles.icon} />
                </button>
                <div className={styles.content}>
                    {
                        (modalToShow) && modal()
                    }
                </div>
            </div>
        </animated.div>
    )
}