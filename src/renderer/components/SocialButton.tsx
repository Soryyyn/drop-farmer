import React from "react";

/**
 * Social button component for using on the home page.
 *
 * @param {Object} props Path of image file for displaying on the button and the
 * onclick action.
 */
export default function SocialButton({ imgPath, onClick }: {
    imgPath: string,
    onClick: () => void
}) {
    return (
        <div
            id="social"
            onClick={onClick}
        >
            <img src={imgPath} />
        </div>
    );
}