export function isRunningOnProd() {
    return process.env.NODE_ENV === 'production';
}
