export function removeTypeFromText(text: string): string {
    if (text.includes('/')) {
        return text.split('/')[1];
    } else {
        return text;
    }
}

export function getTypeFromText(text: string): FarmType {
    return text.split('/')[0] as FarmType;
}

export function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function capitalize(string: string): string {
    return string.replace(/\b\w/g, (toReplace: string) => {
        return toReplace.toUpperCase();
    });
}

/**
 * Check a string with a regex if it's a valid URL.
 */
export function isValidURL(url: string, regex: RegExp): boolean {
    return regex.test(url);
}

/**
 * Get all numbers inside a string.
 */
export function getNumbersInsideString(string: string): number[] {
    return [...string.matchAll(/(\d+)/g)].map((entry) =>
        parseInt(entry.toString())
    );
}
