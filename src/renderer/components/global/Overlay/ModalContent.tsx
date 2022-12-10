import React from "react";

interface Props {
    children: JSX.Element;
    buttons: JSX.Element | JSX.Element[];
}

export default function ModalContent({ children, buttons }: Props) {
    return (
        <div>
            <div>{buttons}</div>
            <div>{children}</div>
        </div>
    );
}
