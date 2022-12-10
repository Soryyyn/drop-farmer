import clsx from "clsx";
import React from "react";
import styles from "../styles/FarmSelector.module.scss";

interface Props {
    selectorName: string;
    handleClick: () => void;
    currentlySelected: string;
}

/**
 * The settings selector on the settings page.
 *
 * @param props The selector name and the click event handler  for the component;
 */
export default function FarmSelector({
    selectorName,
    handleClick,
    currentlySelected
}: Props) {
    return (
        <div
            className={clsx(
                styles.container,
                currentlySelected === selectorName ? styles.selected : null
            )}
            onClick={handleClick}
        >
            {selectorName}
        </div>
    );
}
