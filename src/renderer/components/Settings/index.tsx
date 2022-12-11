import OverlayContent from "@components/global/Overlay/OverlayContent";
import {
    faFloppyDisk,
    faRotateRight,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import { SettingsContext } from "@util/contexts";
import React, { useContext, useState } from "react";
import { ActionButton } from "./ActionButton";

interface Props {
    onClose: () => void;
}

export default function Settings({ onClose }: Props) {
    const { settings, setNewSettings, resetToDefaultSettings } =
        useContext(SettingsContext);

    return (
        <OverlayContent
            buttons={[
                <ActionButton
                    key="reset"
                    icon={faRotateRight}
                    tooltip="Reset settings to default"
                    onClick={resetToDefaultSettings}
                />,
                <ActionButton
                    key="save"
                    icon={faFloppyDisk}
                    tooltip="Save settings"
                    onClick={() => {}}
                />,
                <ActionButton key="close" icon={faXmark} onClick={onClose} />
            ]}
        >
            <p>test1</p>
        </OverlayContent>
    );
}
