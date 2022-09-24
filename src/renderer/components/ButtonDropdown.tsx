import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useRef, useState } from "react";
import styles from "../styles/ButtonDropdown.module.scss";
import { useOutsideAlterter } from "../util/hooks/useOutsideAlterter";
import Tooltip from "./Tooltip";


interface Props {
    children: JSX.Element[] | JSX.Element;
    icon: IconDefinition,
    primary: boolean,
    tooltipText: string,
}

export default function ButtonDropdown({ children, icon, primary, tooltipText }: Props) {
    const [showingDropdown, setShowingDropdown] = useState<boolean>(false);

    /**
     * Handle when the user does not click on the dropdown.
     */
    const ref = useRef(null);
    useOutsideAlterter(ref, () => {
        setShowingDropdown(false);
    });

    return (
        <div className={styles.mainContainer}>
            <div
                className={clsx(styles.buttonContainer, (primary) ? styles.primary : styles.secondary)}
                onClick={() => setShowingDropdown(!showingDropdown)}
            >
                <FontAwesomeIcon icon={icon} size="lg" className={styles.icon} />
            </div>
            {(showingDropdown) &&
                <div
                    className={styles.dropdownContainer}
                    style={{
                        top: -(Array.isArray(children) ? Math.pow(children.length, 2.5) : -3)
                    }}
                    ref={ref}
                >
                    <div onClick={() => setShowingDropdown(false)}>
                        {children}
                    </div>
                </div>
            }
        </div>
    );
}