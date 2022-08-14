import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import Dragbar from "./components/Dragbar";
import Home from "./sites/Home";
import Settings from "./sites/Settings";

export default function App() {
    return (
        <>
            <Dragbar />
            <div id="spacer">
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </HashRouter>
            </div>
        </>
    );
}