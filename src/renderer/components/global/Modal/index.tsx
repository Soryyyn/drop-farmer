import { Transition } from "@headlessui/react";
import PropTypes, { InferProps } from "prop-types";
import React from "react";
import styles from "./index.module.scss";

function Modal({
    content,
    isShowing,
    onRequestClose
}: InferProps<typeof Modal.propTypes>) {
    return (
        <Transition appear={true} show={isShowing}>
            <div className={styles.modalContent}>{content}</div>
        </Transition>
    );
}

Modal.propTypes = {
    content: PropTypes.element.isRequired,
    isShowing: PropTypes.bool.isRequired,
    onRequestClose: PropTypes.func
};

export default Modal;
