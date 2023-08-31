import { nativeImage, NativeImage } from 'electron';
import { resolve } from 'path';
import {
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

/**
 * Get the icon name depending on the environment.
 */
function getEnvironmentDependingIcon(): string {
    return isRunningOnProd() ? defaultIcon : devIcon;
}

/**
 * Get the icon needed for the window.
 */
export function getWindowIcon(): string {
    return resolve(
        __dirname,
        `resources/${getEnvironmentDependingIcon()}.${
            process.platform !== 'linux' ? 'ico' : 'png'
        }`
    );
}

/**
 * Get the approriate image for the tray depending on os.
 */
export function getTrayicon(): NativeImage {
    if (isPlatformWindows()) {
        return nativeImage.createFromPath(
            resolve(__dirname, `resources/${getEnvironmentDependingIcon()}.ico`)
        );
    } else if (isPlatformMacOS()) {
        return nativeImage.createFromPath(
            resolve(__dirname, `resources/${dawinTemplateIcon}.png`)
        );
    } else {
        return nativeImage.createFromPath(
            resolve(__dirname, `resources/${getEnvironmentDependingIcon()}.png`)
        );
    }
}
