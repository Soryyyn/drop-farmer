import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";
import React, { useCallback, useRef, useState } from "react";
import { animated, easings, useTransition } from "react-spring";
import { useOutsideAlterter } from "../hooks";
import styles from "../styles/ButtonDropdown.module.scss";

interface Props {
    icon: IconDefinition;
    primary: boolean;
    dropdownItems: DropdownItem[];
}

export default function ButtonDropdown({
    icon,
    primary,
    dropdownItems
}: Props) {
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
            if (item.type === "label") temp += 12;
            else temp += 4;
        });
        return -temp;
    }, [dropdownItems]);

    /**
     * The to render dropdown items.
     */
    const dropdownItemsList = dropdownItems.map((item, index) => {
        return item.type === "label" ? (
            <li
                key={index}
                className={clsx(
                    styles.dropdownItemLabel,
                    item.disabled ? styles.dropdownItemDisabled : ""
                )}
                onClick={() => {
                    if (!item.disabled) item.action!();
                }}
            >
                <p>{item.label}</p>
            </li>
        ) : (
            <li key={index} className={styles.dropdownSeperator}></li>
        );
    });

    const dropdownMount = useTransition(showingDropdown, {
        from: {
            opacity: 0,
            scale: 0.9
        },
        enter: {
            opacity: 1,
            scale: 1
        },
        leave: {
            opacity: 0,
            scale: 0.9
        },
        config: {
            duration: 100,
            easing: easings.easeInOutQuad
        }
    });

    return (
        <div className={styles.mainContainer}>
            <div
                className={clsx(
                    styles.buttonContainer,
                    primary ? styles.primary : styles.secondary
                )}
                onClick={() => setShowingDropdown(!showingDropdown)}
            >
                <FontAwesomeIcon
                    icon={icon}
                    size="lg"
                    className={styles.icon}
                />
            </div>
            {dropdownMount(
                (extraStyles, item) =>
                    item && (
                        <animated.div
                            style={{
                                ...extraStyles,
                                top: dropdownYOffset()
                            }}
                            className={styles.dropdownContainer}
                            ref={ref}
                        >
                            <ul onClick={() => setShowingDropdown(false)}>
                                {dropdownItemsList}
                            </ul>
                        </animated.div>
                    )
            )}
        </div>
    );
}
