import PropTypes, { InferProps } from "prop-types";
import React from "react";
import styles from "./ModalContent.module.scss";

function ModalContent({
    children,
    buttons
}: InferProps<typeof ModalContent.propTypes>) {
    return (
        <div className={styles.container}>
            <div>{buttons}</div>
            <div>{children}</div>
        </div>
    );
}

ModalContent.propTypes = {
    children: PropTypes.element.isRequired,
    buttons: PropTypes.arrayOf(PropTypes.element).isRequired
};

export default ModalContent;
