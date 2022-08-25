import React from "react";

/**
 * The settings selector on the settings page.
 *
 * @param props The selector name and the click event handler  for the component;
 */
export default function FarmSelector({ selectorName, handleClick, currentlySelected }: {
    selectorName: string,
    handleClick: () => void,
    currentlySelected: string
}) {
    return (
        <div
            id="settings-selector"
            className={(currentlySelected === selectorName) ? "settings-selector-selected" : ""}
            onClick={handleClick}
        >
            {selectorName}
        </div >
    );
}