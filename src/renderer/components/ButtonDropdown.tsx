import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useState } from "react";
import styles from "../styles/ButtonDropdown.module.scss";
import Tooltip from "./Tooltip";


interface Props {
    children: JSX.Element[] | JSX.Element;
    icon: IconDefinition,
    primary: boolean,
    tooltipText: string,
}

export default function ButtonDropdown({ children, icon, primary, tooltipText }: Props) {
    const [showingDropdown, setShowingDropdown] = useState<boolean>(false);

    return (
        <div className={styles.mainContainer}>
            <Tooltip
                tooltipText={tooltipText}
                placement="bottom"
            >
                <div
                    className={clsx(styles.buttonContainer, (primary) ? styles.primary : styles.secondary)}
                    onClick={() => setShowingDropdown(!showingDropdown)}
                >
                    <FontAwesomeIcon icon={icon} size="lg" className={styles.icon} />
                </div>
            </Tooltip>
            {(showingDropdown) &&
                <div
                    className={styles.dropdownContainer}
                    style={{
                        top: -(Array.isArray(children) ? Math.pow(children.length, 2.5) : -3)
                    }}
                >
                    <div onClick={() => setShowingDropdown(false)}>
                        {children}
                    </div>
                </div>
            }
        </div>
    );
}