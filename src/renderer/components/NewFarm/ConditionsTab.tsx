import DateInput from '@components/global/Inputs/DateInput';
import NumberInput from '@components/global/Inputs/NumberInput';
import Select from '@components/global/Inputs/Select';
import Switch from '@components/global/Inputs/Switch';
import React, { useEffect, useState } from 'react';

export type ConditionsObject = {
    type: ConditionType;
    amountToFulFill?: number;
    buffer?: number;
    repeating?: boolean;
    from?: string;
    to?: string;
};

interface Props {
    data: ConditionsObject;
    onChange: (changedConditions: ConditionsObject) => void;
}

export default function ConditionsTab({ data, onChange }: Props) {
    const [conditionsInfo, setConditionsInfo] =
        useState<ConditionsObject>(data);

    useEffect(() => {
        onChange(conditionsInfo);
    }, [conditionsInfo]);

    return (
        <div className="flex flex-col gap-4">
            <Select
                label="Type of condition"
                value={conditionsInfo.type}
                fullWidth
                options={api.selections.FarmConditionSelect}
                onChange={(changed) =>
                    setConditionsInfo({
                        ...conditionsInfo,
                        type: changed
                    })
                }
            />

            {(conditionsInfo.type === 'weekly' ||
                conditionsInfo.type === 'monthly' ||
                conditionsInfo.type === 'timeWindow') && (
                <>
                    <span className="bg-pepper-400 h-0.5 w-[98%] rounded-full self-center" />

                    <NumberInput
                        label="Amount to fulfill in timespan (in hours)"
                        value={conditionsInfo.amountToFulFill ?? 4}
                        min={1}
                        max={100}
                        withButtons
                        fullWidth
                        onChange={(changed) =>
                            setConditionsInfo({
                                ...conditionsInfo,
                                amountToFulFill: changed
                            })
                        }
                    />

                    <NumberInput
                        label="Buffer for fulfillment (in minutes)"
                        value={conditionsInfo.buffer ?? 30}
                        min={0}
                        max={60}
                        withButtons
                        fullWidth
                        onChange={(changed) =>
                            setConditionsInfo({
                                ...conditionsInfo,
                                buffer: changed
                            })
                        }
                    />
                </>
            )}

            {(conditionsInfo.type === 'weekly' ||
                conditionsInfo.type === 'monthly') && (
                <>
                    <span className="bg-pepper-400 h-0.5 w-[98%] rounded-full self-center" />

                    <Switch
                        label="Repeat after fulfillment"
                        value={conditionsInfo.repeating ?? false}
                        onChange={(changed) =>
                            setConditionsInfo({
                                ...conditionsInfo,
                                repeating: changed
                            })
                        }
                    />
                </>
            )}

            {conditionsInfo.type === 'timeWindow' && (
                <>
                    <span className="bg-pepper-400 h-0.5 w-[98%] rounded-full self-center" />

                    <div className="flex flex-row justify-evenly gap-2">
                        <DateInput
                            label="From (start date)"
                            fullWidth
                            value={conditionsInfo.from}
                            onChange={(changed) =>
                                setConditionsInfo({
                                    ...conditionsInfo,
                                    from: changed
                                })
                            }
                        />

                        <DateInput
                            label="To (end date)"
                            fullWidth
                            value={conditionsInfo.to}
                            onChange={(changed) =>
                                setConditionsInfo({
                                    ...conditionsInfo,
                                    to: changed
                                })
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
}
