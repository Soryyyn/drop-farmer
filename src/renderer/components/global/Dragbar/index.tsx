import React from "react";

export default function Dragbar() {
    return (
        <div className="absolute top-0 left-0 w-screen h-8 [-webkit-app-region:drag]"></div>
    );
}
