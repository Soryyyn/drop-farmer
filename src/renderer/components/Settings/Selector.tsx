import React from "react";

interface Props {
    label: string;
    onClick: () => void;
}

export default function Selector({ label, onClick }: Props) {
    return <li onClick={onClick}>{label}</li>;
}
