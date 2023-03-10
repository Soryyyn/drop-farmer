import OverlayContainer from '@components/global/Overlay/OverlayContainer';
import OverlayContent from '@components/global/Overlay/OverlayContent';
import TabSwitcher from '@components/global/TabSwitcher';
import ActionButton from '@components/Settings/ActionButton';
import { faFloppyDisk, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FarmsContext } from '@renderer/util/contexts';
import React, { useContext, useEffect, useState } from 'react';
import BasicInfoTab, { BasicInfoObject } from './BasicInfoTab';
import ConditionsTab from './ConditionsTab';

interface Props {
    onClose: () => void;
}

export default function NewFarm({ onClose }: Props) {
    const { addFarm, isValid, resetValidation } = useContext(FarmsContext);

    const [details, setDetails] = useState<NewFarm>({
        id: '',
        schedule: 30,
        type: 'youtube',
        url: '',
        conditions: {
            condition: {
                type: 'unlimited'
            }
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
                        onClick={() => addFarm(details)}
                    />,
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <TabSwitcher
                    tabs={[
                        {
                            title: 'Basic Settings',
                            desc: (
                                <p>
                                    On this tab basic details about the farm you
                                    want to add are defined.
                                    <br />
                                    <br />
                                    It is important to set the farming location
                                    to correct value. If you want to farm from a
                                    twitch stream, set the location to twitch.
                                    <br />
                                    <br />
                                    The schedule defines how Drop Farmer will
                                    check if it can farm for the given farm
                                    every set minutes.
                                </p>
                            ),
                            content: (
                                <BasicInfoTab
                                    data={{
                                        ...details
                                    }}
                                    onChange={(info) =>
                                        setDetails({
                                            ...details,
                                            ...info
                                        })
                                    }
                                />
                            )
                        },
                        {
                            title: 'Conditions',
                            desc: (
                                <p>
                                    On this tab the conditions on how to farm
                                    are defined.
                                    <br />
                                    <br />
                                    When the type is set to
                                    &quot;Unlimited&quot; Drop Farmer will try
                                    to farm to farm as much as possible. When
                                    set to &quot;Weekly&quot; or
                                    &quot;Monthly&quot; Drop Farmer will try to
                                    fulfill the amount given (in hours) in the
                                    given timespan.
                                    <br />
                                    A buffer (in minutes), which is added on top
                                    of the amount to fulfill can also be defined
                                    if the drop times are a bit flaky.
                                    <br />
                                    When enabling the repeating setting, the
                                    farm will reset the condition and timespan
                                    after it reached either the amount to
                                    fulfill or the timespan.
                                    <br />
                                    <br />
                                    When the type is set to &quot;From ... to
                                    ...&quot;, Drop Farmer will try to fulfill
                                    the amount given in that exact timespan.
                                    <br />
                                </p>
                            ),
                            content: (
                                <ConditionsTab
                                    data={{ ...details.conditions.condition }}
                                    onChange={(info) =>
                                        setDetails({
                                            ...details,
                                            conditions: {
                                                condition: {
                                                    ...info
                                                }
                                            }
                                        })
                                    }
                                />
                            )
                        }
                    ]}
                />
            </OverlayContent>
        </OverlayContainer>
    );
}
