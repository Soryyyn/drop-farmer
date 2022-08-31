import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.scss";

/**
 * Create the root and render the app on it.
 */
const root = createRoot(document.getElementById("root")!);
root.render(<App />,);