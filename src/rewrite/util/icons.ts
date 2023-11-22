import { nativeImage } from 'electron';
import { RESOURCES_PATH } from './constants';
import {
    isPlatformLinux,
    isPlatformMacOS,
    isPlatformWindows,
    isRunningOnProd
} from './environment';

/**
 * Icon names.
 */
const defaultIcon: string = 'icon-normal';
const devIcon: string = 'icon-dev';
const dawinTemplateIcon: string = 'icon-macosTemplate';

function getEnvironmentDependingIcon() {
    return isRunningOnProd() ? defaultIcon : devIcon;
}

/**
 * Get the icon needed for the window.
 */
export function getWindowIcon() {
    return `${RESOURCES_PATH}/${getEnvironmentDependingIcon()}.${
        isPlatformLinux() ? 'png' : 'ico'
    }`;
}

/**
 * Get the approriate image for the tray depending on os.
 */
export function getTrayicon() {
    if (isPlatformWindows()) {
        return nativeImage.createFromPath(
            `${RESOURCES_PATH}/${getEnvironmentDependingIcon()}.ico`
        );
    } else if (isPlatformMacOS()) {
        return nativeImage.createFromPath(
            `${RESOURCES_PATH}/${dawinTemplateIcon}.png`
        );
    } else {
        return nativeImage.createFromPath(
            `${RESOURCES_PATH}/${getEnvironmentDependingIcon()}.png`
        );
    }
}
