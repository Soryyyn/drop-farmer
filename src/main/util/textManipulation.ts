export function normalize(text: string): string {
    const specialCharactersRemoved = text.replace(/[^a-zA-Z0-9 ]/g, '');
    const spacesToDashes = specialCharactersRemoved.replace(' ', '-');
    return spacesToDashes;
}
