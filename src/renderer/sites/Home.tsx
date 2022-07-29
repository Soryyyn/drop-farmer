import React from "react";

export default function Home() {
    return (
        <div id="home-divider">
            <div id="home-farms-status">farms are listed here with status</div>
            <div id="home-container">
                <div id="home-content">
                    <video autoPlay loop>
                        <source src="assets/crate-falling.webm" type="video/webm" />
                    </video>
                    <h1 id="home-title">DROP-FARMER</h1>
                    <p id="home-desc">Stream drops farmer application</p>
                    <div id="home-socials">
                        <div>
                            <img src="assets/github.svg" />
                        </div>
                        <div>
                            <img src="assets/mail.svg" />
                        </div>
                        <div>
                            <img src="assets/web.svg" />
                        </div>
                        <div>
                            <img src="assets/gear.svg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}