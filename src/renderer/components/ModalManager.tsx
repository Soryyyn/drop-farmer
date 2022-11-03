import React, { useCallback, useState } from "react";
import { animated, easings, useTransition } from "react-spring";
import Settings from "../modals/Settings/Settings";
import styles from "../styles/ModalManager.module.scss";

interface Props {
    modalToShow: "settings" | "add-new-farm";
    showing: boolean;
    handleClosing: () => void;
}

export default function ModalManager({
    modalToShow,
    showing,
    handleClosing
}: Props) {
    /**
     * The callback to control which modal to show depending on the
     * `modalToShow` prop.
     */
    const modal = useCallback(() => {
        if (modalToShow === "settings") {
            return <Settings handleClosing={handleClosing} />;
        } else if (modalToShow === "add-new-farm") {
            return <p>add new farm</p>;
        }
    }, []);

    /**
     * The animation for animation the mounting of the modal manager component.
     */
    const mountTransition = useTransition(showing, {
        from: {
            opacity: 0,
            width: "90%",
            height: "90%"
        },
        enter: {
            opacity: 1,
            width: "100%",
            height: "100%"
        },
        leave: {
            opacity: 0,
            width: "90%",
            height: "90%"
        },
        config: {
            duration: 100,
            easing: easings.easeInOutQuad
        }
    });

    /**
     * Animate mounting of modal.
     */
    return mountTransition(
        (extraStyles, item) =>
            item && (
                <animated.div style={extraStyles} className={styles.bgFilter}>
                    <div className={styles.container}>
                        <div className={styles.content}>
                            {modalToShow && showing && modal()}
                        </div>
                    </div>
                </animated.div>
            )
    );
}
