import OverlayContent from "@components/global/Overlay/OverlayContent";
import {
    faFloppyDisk,
    faRotateRight,
    faXmark
} from "@fortawesome/free-solid-svg-icons";
import { DEFAULT_SELECTED_SETTING } from "@util/constants";
import { SettingsContext } from "@util/contexts";
import React, { useContext, useState } from "react";
import { ActionButton } from "./ActionButton";
import Selector from "./Selector";

interface Props {
    onClose: () => void;
}

export default function Settings({ onClose }: Props) {
    const { settings, setNewSettings, resetToDefaultSettings } =
        useContext(SettingsContext);
    const [selected, setSelected] = useState<string>(DEFAULT_SELECTED_SETTING);

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
            <div className="flex flex-row h-full w-full gap-8">
                {/* Selectors */}
                <ul className="min-w-1/4 flex flex-col gap-1 list-none">
                    {Object.keys(settings!).map((selector) => {
                        return (
                            <Selector
                                key={selector}
                                label={selector}
                                onClick={() => setSelected(selector)}
                            />
                        );
                    })}
                </ul>

                {/* Setting */}
                <ul className="grow flex flex-col gap-4">
                    {settings![selected].map((setting) => {
                        return <p key={setting.name}>{setting.name}</p>;
                    })}
                </ul>
            </div>
        </OverlayContent>
    );
}
