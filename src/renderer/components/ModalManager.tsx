import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { animated, easings, useTransition } from "react-spring";
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
     * Only display modal if showing is true.
     */
    // if (showing)
    //     return (
    //         <div className={styles.bgFilter}>
    //             <div className={styles.container}>
    //                 <button
    //                     onClick={handleClosing}
    //                     className={styles.closeModalButton}
    //                 >
    //                     <FontAwesomeIcon icon={faXmark} size="lg" className={styles.icon} />
    //                 </button>
    //                 <div className={styles.content}></div>
    //             </div>
    //         </div>
    //     );
    // else
    //     return <></>;

    return mountTransition((extraStyles, item) => item &&
        <animated.div style={extraStyles} className={styles.bgFilter}>
            <div className={styles.container}>
                <button
                    onClick={handleClosing}
                    className={styles.closeModalButton}
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" className={styles.icon} />
                </button>
                <div className={styles.content}></div>
            </div>
        </animated.div>
    )
}