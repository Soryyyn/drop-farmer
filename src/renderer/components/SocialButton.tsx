import React from "react";

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