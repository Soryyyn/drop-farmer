import { OverlayContainer } from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import { ActionButton } from '@components/Settings/ActionButton';
import { faBoxOpen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FarmsContext } from '@renderer/util/contexts';
import React, { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import NumberInput from './NumberInput';
import Section from './Section';
import Select from './Select';
import TextInformation from './TextInformation';
import TextInput from './TextInput';

interface Props {
    onClose: () => void;
}

export default function NewFarm({ onClose }: Props) {
    const { addFarm } = useContext(FarmsContext);

    const [farmDetails, setFarmDetails] = useState<NewFarm>({
        id: '',
        schedule: 30,
        type: 'youtube',
        url: ''
    });

    function validateUrl(): boolean {
        let regex;

        switch (farmDetails.type) {
            case 'twitch':
                regex = new RegExp(
                    /(?:www\.|go\.)?twitch\.tv\/([a-zA-Z0-9_]+)($|\?)/
                );
                break;
            case 'youtube':
                regex = new RegExp(
                    /http(s)?:\/\/(www|m).youtube.com\/((channel|c)\/)?(?!feed|user\/|watch\?)([a-zA-Z0-9-_.])*.*/
                );
                break;
        }

        return regex.test(farmDetails.url);
    }

    return (
        <OverlayContainer>
            <OverlayContent
                buttons={[
                    <ActionButton
                        key="newFarm"
                        icon={faBoxOpen}
                        tooltip="Create a new farm with the filled out details"
                        onClick={() => {
                            if (
                                validateUrl() &&
                                farmDetails.id.trim().length !== 0
                            ) {
                                addFarm(farmDetails);
                                onClose();
                            } else {
                                toast.error(
                                    'The given farm details are not valid. Please enter valid details to create the farm.',
                                    {
                                        id: 'non-valid-farm-details',
                                        duration: 4000
                                    }
                                );
                            }
                        }}
                    />,
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <div className="flex flex-col h-full w-full gap-4">
                    <Section title="Details">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-4">
                                <div className="w-2/3">
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
                        <p>coming...</p>
                    </Section>
                </div>
            </OverlayContent>
        </OverlayContainer>
    );
}
