import React from "react";

interface Props {
    children: JSX.Element;
    isShowing: boolean;
}

export default function Modal({ children }: Props) {
    return (
        <div className="z-10 absolute h-full w-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center origin-center">
            <div className="relative box-border p-6 h-modal w-modal bg-pepper-500 rounded-xl">
                {children}
            </div>
        </div>
    );
}
