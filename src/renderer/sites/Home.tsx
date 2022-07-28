import React from "react";

export default function Home() {
    return (
        <div id="home-container">
            <video autoPlay loop>
                <source src="../assets/0001-0192.webm" type="video/webm" />
            </video>
            <h1 id="title">drop-farmer</h1>
        </div>
    );
}