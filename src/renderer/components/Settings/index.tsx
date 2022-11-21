import ModalContent from "@components/global/Modal/ModalContent";
import PropTypes, { InferProps } from "prop-types";
import React from "react";

function Settings({ title }: InferProps<typeof Settings.propTypes>) {
    return (
        <ModalContent
            buttons={
                [
                    // <button>b1</button>,
                    // <button>b2</button>,
                    // <button>b3</button>
                ]
            }
        >
            <p>test1</p>
        </ModalContent>
    );
}

Settings.propTypes = {
    title: PropTypes.string
};

export default Settings;
