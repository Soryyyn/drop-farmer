import { OverlayContainer } from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import { ActionButton } from '@components/Settings/ActionButton';
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FarmsContext } from '@renderer/util/contexts';
import React, { useContext, useEffect, useState } from 'react';
import DateInput from './DateInput';
import NumberInput from './NumberInput';
import Section from './Section';
import Select from './Select';
import SwitchToggle from './SwitchToggle';
import TextInformation from './TextInformation';
import TextInput from './TextInput';

interface Props {
    onClose: () => void;
}

export default function NewFarm({ onClose }: Props) {
    const { addFarm, isValid, resetValidation } = useContext(FarmsContext);

    const [farmDetails, setFarmDetails] = useState<NewFarm>({
        id: '',
        schedule: 30,
        type: 'youtube',
        url: '',
        conditions: {
            timeframe: 'monthly',
            amountToFulfill: 4,
            buffer: 30,
            repeating: true
        }
    });

    /**
     * Close the modal if the validation succeeded.
     */
    useEffect(() => {
        if (isValid === true) {
            onClose();
            resetValidation();
        }
    }, [isValid]);

    return (
        <OverlayContainer>
            <OverlayContent
                buttons={[
                    <ActionButton
                        key="newFarm"
                        icon={faFloppyDisk}
                        tooltip="Create a new farm with the filled out details"
                        onClick={() => addFarm(farmDetails)}
                    />,
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <div className="flex flex-col h-full w-full gap-4 overflow-y-auto">
                    <Section title="Details">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-4">
                                <div className="w-4/5">
                                    <TextInput
                                        label="Name"
                                        value={farmDetails.id}
                                        required={true}
                                        onChange={(changed) =>
                                            setFarmDetails({
                                                ...farmDetails,
                                                id: changed
                                            })
                                        }
                                    />
                                </div>
                                <NumberInput
                                    label="Schedule (in minutes)"
                                    value={farmDetails.schedule}
                                    required={true}
                                    min={1}
                                    max={60}
                                    onChange={(changed) =>
                                        setFarmDetails({
                                            ...farmDetails,
                                            schedule: changed
                                        })
                                    }
                                />
                            </div>
                            <Select
                                label="Farming location"
                                value={farmDetails.type}
                                required={true}
                                options={['youtube', 'twitch']}
                                onSelected={(selected: FarmType) => {
                                    setFarmDetails({
                                        ...farmDetails,
                                        type: selected
                                    });
                                }}
                            />
                            <TextInput
                                label="URL"
                                value={farmDetails.url}
                                required={true}
                                onChange={(changed) =>
                                    setFarmDetails({
                                        ...farmDetails,
                                        url: changed
                                    })
                                }
                            />

                            <TextInformation
                                label="Important"
                                text="For drop-farmer to actually be able to farm drops from Twitch, YouTube, etc. you must connect your accounts to the wanted platforms. If not done, you will only rack up on watchtime and nothing else, which defeats the purpose of drop-farmer."
                            />
                        </div>
                    </Section>

                    <Section title="Farming Conditions">
                        <div className="flex flex-col gap-4">
                            <Select
                                label="Timeframe"
                                value={farmDetails.conditions.timeframe}
                                required={true}
                                options={[
                                    'unlimited',
                                    'weekly',
                                    'monthly',
                                    'from ... to ...'
                                ]}
                                onSelected={(selected: Timeframe) => {
                                    setFarmDetails({
                                        ...farmDetails,
                                        conditions: {
                                            ...farmDetails.conditions,
                                            timeframe: selected
                                        }
                                    });
                                }}
                            />

                            {farmDetails.conditions.timeframe ===
                                'from ... to ...' && (
                                <div>
                                    <DateInput
                                        label="From"
                                        required={true}
                                        value={new Date()}
                                        onSelected={() => {}}
                                    />
                                </div>
                            )}

                            <div className="flex flex-row gap-4">
                                <NumberInput
                                    label="Amount to fulfill condition (in hours)"
                                    value={
                                        farmDetails.conditions.amountToFulfill!
                                    }
                                    required={
                                        farmDetails.conditions.timeframe !==
                                        'unlimited'
                                    }
                                    min={1}
                                    max={730}
                                    onChange={(changed) =>
                                        setFarmDetails({
                                            ...farmDetails,
                                            conditions: {
                                                ...farmDetails.conditions,
                                                amountToFulfill: changed
                                            }
                                        })
                                    }
                                />
                                <NumberInput
                                    label="Buffer (in minutes)"
                                    value={farmDetails.conditions.buffer!}
                                    required={
                                        farmDetails.conditions.timeframe !==
                                        'unlimited'
                                    }
                                    min={0}
                                    max={60}
                                    onChange={(changed) =>
                                        setFarmDetails({
                                            ...farmDetails,
                                            conditions: {
                                                ...farmDetails.conditions,
                                                buffer: changed
                                            }
                                        })
                                    }
                                />

                                <SwitchToggle
                                    label="Repeating"
                                    required={
                                        farmDetails.conditions.timeframe !==
                                        'unlimited'
                                    }
                                    value={farmDetails.conditions.repeating!}
                                    onChange={(changed) =>
                                        setFarmDetails({
                                            ...farmDetails,
                                            conditions: {
                                                ...farmDetails.conditions,
                                                repeating: changed
                                            }
                                        })
                                    }
                                />
                            </div>

                            <TextInformation
                                label="Important"
                                text="For drop-farmer to actually be able to farm drops from Twitch, YouTube, etc. you must connect your accounts to the wanted platforms. If not done, you will only rack up on watchtime and nothing else, which defeats the purpose of drop-farmer."
                            />
                        </div>
                    </Section>
                </div>
            </OverlayContent>
        </OverlayContainer>
    );
}
