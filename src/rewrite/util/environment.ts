/**
 * Check if the app is running in a production environment.
 */
export function isRunningOnProd() {
    return process.env.NODE_ENV === 'production';
}

export function isPlatformWindows() {
    return process.platform === 'win32';
}

export function isPlatformMacOS() {
    return process.platform === 'darwin';
}
