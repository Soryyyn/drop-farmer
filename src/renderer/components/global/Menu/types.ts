export type MenuEntry = {
    label: string;
    disabled?: boolean;
    caution?: boolean;
    styling?: string;
    onClick: () => void;
};

export enum Alignment {
    TopLeft = 0,
    TopRight = 1,
    BottomLeft = 2,
    BottomRight = 3
}
