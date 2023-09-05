import { nativeImage } from 'electron';
import {
    isPlatformLinux,
    isPlatformMacOS,
    isPlatformWindows,
    isRunningOnProd
} from './environment';
import { ResourcesPath } from './files';

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
    return `${ResourcesPath}/${getEnvironmentDependingIcon()}.${
        isPlatformLinux() ? 'png' : 'ico'
    }`;
}

/**
 * Get the approriate image for the tray depending on os.
 */
export function getTrayicon() {
    if (isPlatformWindows()) {
        return nativeImage.createFromPath(
            `${ResourcesPath}/${getEnvironmentDependingIcon()}.ico`
        );
    } else if (isPlatformMacOS()) {
        return nativeImage.createFromPath(
            `${ResourcesPath}/${dawinTemplateIcon}.png`
        );
    } else {
        return nativeImage.createFromPath(
            `${ResourcesPath}/${getEnvironmentDependingIcon()}.png`
        );
    }
}
