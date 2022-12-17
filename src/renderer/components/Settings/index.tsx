import { OverlayContainer } from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import {
    faFloppyDisk,
    faRotateRight,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import { SettingsContext } from '@util/contexts';
import React, { useContext, useState } from 'react';
import { ActionButton } from './ActionButton';
import Selector from './Selector';
import Setting from './Setting';

interface Props {
    onClose: () => void;
}

export default function Settings({ onClose }: Props) {
    const { settings, setNewSettings, resetToDefaultSettings } =
        useContext(SettingsContext);
    const [selected, setSelected] = useState<string>('application');
    const [currentSettings, setCurrentSettings] = useState(settings);

    return (
        <OverlayContainer>
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
                        onClick={() => setNewSettings(currentSettings!)}
                    />,
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <div className="flex flex-row h-full w-full gap-8">
                    {/* Selectors */}
                    <ul className="min-w-fit max-w-[25%] flex flex-col gap-2 list-none">
                        {Object.keys(settings!).map((selector) => {
                            return (
                                <Selector
                                    key={selector}
                                    label={selector}
                                    isSelected={selector === selected}
                                    onClick={() => setSelected(selector)}
                                />
                            );
                        })}
                    </ul>

                    {/* Settings */}
                    <ul className="grow flex flex-col gap-4">
                        {settings![selected].map((setting) => {
                            return (
                                <Setting
                                    key={setting.name}
                                    setting={setting}
                                    onChange={(updated) => {
                                        const copyOfSettings = { ...settings };
                                        const newFarmSetting = { ...setting };

                                        copyOfSettings[selected].forEach(
                                            (s) => {
                                                if (
                                                    newFarmSetting.name ===
                                                    s.name
                                                ) {
                                                    s.value = updated;
                                                    s = newFarmSetting;
                                                }
                                            }
                                        );

                                        setCurrentSettings(copyOfSettings);
                                    }}
                                />
                            );
                        })}
                    </ul>
                </div>
            </OverlayContent>
        </OverlayContainer>
    );
}
