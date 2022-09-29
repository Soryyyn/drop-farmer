import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useCallback, useRef, useState } from "react";
import styles from "../styles/ButtonDropdown.module.scss";
import { useOutsideAlterter } from "../util/hooks/useOutsideAlterter";
import Tooltip from "./Tooltip";


interface Props {
    icon: IconDefinition,
    primary: boolean,
    dropdownItems: DropdownItem[]
}

export default function ButtonDropdown({ icon, primary, dropdownItems }: Props) {
    const [showingDropdown, setShowingDropdown] = useState<boolean>(false);

    /**
     * Handle when the user does not click on the dropdown.
     */
    const ref = useRef(null);
    useOutsideAlterter(ref, () => {
        setShowingDropdown(false);
    });

    /**
     * The vertical (y) offset of the shown dropdown.
     */
    const dropdownYOffset = useCallback(() => {
        let temp = 0;
        dropdownItems.forEach((item) => {
            if (item.type === "label")
                temp += 12
            else temp += 4
        });
        return -temp;
    }, [dropdownItems]);

    /**
     * The to render dropdown items.
     */
    const dropdownItemsList = dropdownItems.map((item) => {
        return (item.type === "label")
            ? <li
                className={clsx(styles.dropdownItemLabel, (item.disabled ? styles.dropdownItemDisabled : ""))}
                onClick={() => {
                    if (!item.disabled)
                        item.action!();
                }}
            >
                <p>{item.label}</p>
            </li>
            : <li className={styles.dropdownSeperator}></li>
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
                        top: dropdownYOffset()
                    }}
                    ref={ref}
                >
                    <ul onClick={() => setShowingDropdown(false)}>
                        {dropdownItemsList}
                    </ul>
                </div>
            }
        </div>
    );
}