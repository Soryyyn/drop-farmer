import OverlayContainer from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import { FarmsContext } from '@contexts/FarmsContext';
import { SettingsContext } from '@contexts/SettingsContext';
import { SettingValueWithSpecial } from '@df-types/settings.types';
import {
    faFloppyDisk,
    faRotateRight,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import React, { useContext, useState } from 'react';
import Selector from './Selector';
import Setting from './Setting';

interface Props {
    onClose: () => void;
}

export default function Settings({ onClose }: Props) {
    const { settings, setNewSettings, resetToDefaultSettings } =
        useContext(SettingsContext);
    const { farms } = useContext(FarmsContext);
    const [selected, setSelected] = useState<string>('application');
    const [currentSettings, setCurrentSettings] = useState(settings);

    return (
        <OverlayContainer>
            <OverlayContent
                buttons={[
                    {
                        icon: faRotateRight,
                        tooltip: 'Reset settings to default',
                        onClick: () => resetToDefaultSettings()
                    },
                    {
                        icon: faFloppyDisk,
                        tooltip: 'Save settings',
                        onClick: () => setNewSettings(currentSettings!)
                    },
                    {
                        icon: faXmark,
                        caution: true,
                        onClick: () => onClose()
                    }
                ]}
            >
                <div className="flex flex-row h-full w-full gap-8 overflow-y-auto">
                    <ul className="min-w-fit max-w-[25%] flex flex-col gap-2 list-none">
                        <Selector
                            key="application"
                            label="Application"
                            isSelected={'application' === selected}
                            onClick={() => setSelected('application')}
                        />

                        <span className="bg-pepper-500/50 h-0.5 w-[98%] rounded-full self-center" />

                        {farms.map((farm) => {
                            return (
                                <Selector
                                    key={farm.id}
                                    label={api.removeTypeFromText(farm.id)}
                                    isSelected={farm.id === selected}
                                    onClick={() => setSelected(farm.id)}
                                />
                            );
                        })}
                    </ul>

                    {/* Settings */}
                    <ul className="grow flex flex-col gap-4 overflow-y-auto">
                        {settings?.[selected].map((setting) => {
                            /**
                             * Only render a setting, if it has a shown name and
                             * description set (used for setting which don't
                             * need to be shown to the user)
                             */
                            if (setting.shown && setting.desc) {
                                return (
                                    <Setting
                                        key={`${selected}-${setting.id}`}
                                        setting={setting}
                                        onChange={(updated) => {
                                            const copyOfSettings = {
                                                ...settings
                                            };
                                            const newFarmSetting = {
                                                ...setting
                                            };

                                            copyOfSettings[selected].forEach(
                                                (s) => {
                                                    if (
                                                        newFarmSetting.id ===
                                                        s.id
                                                    ) {
                                                        if (
                                                            (
                                                                s.value as SettingValueWithSpecial
                                                            ).value !==
                                                            undefined
                                                        ) {
                                                            (
                                                                s.value as SettingValueWithSpecial
                                                            ).value = updated;
                                                            s = newFarmSetting;
                                                        } else {
                                                            s.value = updated;
                                                            s = newFarmSetting;
                                                        }
                                                    }
                                                }
                                            );

                                            setCurrentSettings(copyOfSettings);
                                        }}
                                    />
                                );
                            }
                        })}
                    </ul>
                </div>
            </OverlayContent>
        </OverlayContainer>
    );
}
