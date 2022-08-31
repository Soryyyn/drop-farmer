import React from "react";
import styles from "../styles/DisplayWindowsButton.module.scss";

interface Props {
    showing: boolean;
    handleChange: (showing: boolean) => void;
}

export default function DisplayWindowsButton({ showing, handleChange }: Props) {
    return (
        <div className={styles.container}>
            <div
                id="farms-status-side"
                onClick={() => {
                    handleChange(!showing);
                }}
            >
                {
                    (showing)
                        ? <img src="../assets/visible.svg" />
                        : <img src="../assets/invisible.svg" />
                }
            </div>
        </div>
    );
}