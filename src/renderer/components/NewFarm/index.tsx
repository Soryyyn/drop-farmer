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

    const [finishedFillingOut, setFinishedFillingOut] = useState(false);
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
                    ...(finishedFillingOut
                        ? [
                              <ActionButton
                                  key="newFarm"
                                  icon={faFloppyDisk}
                                  tooltip="Create a new farm with the filled out details"
                                  onClick={() => {}}
                              />
                          ]
                        : []),
                    <ActionButton
                        key="close"
                        icon={faXmark}
                        onClick={onClose}
                    />
                ]}
            >
                <TabSwitcher
                    onLastTab={(isOnLastTab) =>
                        setFinishedFillingOut(isOnLastTab)
                    }
                    tabs={[
                        {
                            title: 'Basic Settings',
                            desc: 'Test desc asdasdadsasdasd as sdasasd sdsd aasdasdasdasdasdasd as',
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
                            desc: 'Test desc asdasdadsasdasd as sdasasd sdsd aasdasdasdasdasdasd as',
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
