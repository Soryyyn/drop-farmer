export function removeTypeFromText(text: string): string {
    if (text.includes('/')) {
        return text.split('/')[1];
    } else {
        return text;
    }
}
