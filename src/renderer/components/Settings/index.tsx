import OverlayContent from "@components/global/Overlay/OverlayContent";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";
import PropTypes, { InferProps } from "prop-types";
import React from "react";
import { ActionButton } from "./ActionButton";

function Settings({ title }: InferProps<typeof Settings.propTypes>) {
    return (
        <OverlayContent
            buttons={[
                <ActionButton
                    key="test"
                    icon={faRotateRight}
                    tooltip="noice"
                    onClick={() => console.log("pressed")}
                />
            ]}
        >
            <p>test1</p>
        </OverlayContent>
    );
}

Settings.propTypes = {
    title: PropTypes.string
};

export default Settings;
