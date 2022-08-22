import React from "react";

/**
 * The settings selector on the settings page.
 *
 * @param props The selector name and the click event handler  for the component;
 */
export default function FarmSelector({ selectorName, handleClick }: {
    selectorName: string,
    handleClick: () => void
}) {
    return (
        <div
            id="settings-selector"
            onClick={handleClick}
        >
            {selectorName}
        </div>
    );
}