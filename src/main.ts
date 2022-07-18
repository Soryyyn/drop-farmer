import { initLogger } from "./logger";
import { initSettings } from "./settings";
import { initFarms } from "./farms";

function initApp() {
    initLogger();
    initSettings();
    initFarms();
}

initApp();