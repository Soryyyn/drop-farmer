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
