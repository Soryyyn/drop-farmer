import React from "react";

/**
 * Extra button component for using on the home page.
 *
 * @param {Object} props Path of image file for displaying on the button and the
 * onclick action.
 */
export default function ExtraButton({ imgPath, onClick }: {
    imgPath: string,
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
        >
            <img src={imgPath} />
        </div>
    );
}