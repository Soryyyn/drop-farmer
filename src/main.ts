import { initLogger } from "./logger";
import { initSettings, getCurrentSettings } from "./settings";

function initApp() {
    initLogger();
    initSettings();
}

initApp();