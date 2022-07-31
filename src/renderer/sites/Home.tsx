import React from "react";
import SocialButton from "../components/SocialButton";

export default function Home() {
    return (
        <div id="home-divider">
            <div id="home-farms-status">farms are listed here with status</div>
            <div id="home-container">
                <div id="home-content">
                    <video autoPlay loop>
                        <source src="../assets/crate-falling.webm" type="video/webm" />
                    </video>
                    <h1 id="home-title">DROP-FARMER</h1>
                    <p id="home-desc">Stream drops farmer application</p>
                    <div id="home-socials">
                        <SocialButton imgPath="../assets/github.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://github.com/Soryyyn");
                        }} />
                        <SocialButton imgPath="../assets/web.svg" onClick={() => {
                            window.api.callMain(window.api.channels.openLinkInExternal, "https://soryn.dev");
                        }} />
                        <div>
                            <img src="../assets/gear.svg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}