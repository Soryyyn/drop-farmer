import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
                {showing ? (
                    <FontAwesomeIcon
                        icon={faEye}
                        size="xl"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faEyeSlash}
                        size="xl"
                        className={styles.icon}
                        fixedWidth={true}
                    />
                )}
            </div>
        </div>
    );
}
