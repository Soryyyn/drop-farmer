import React, { useState } from 'react';

export type ConditionsObject = {
    type: ConditionType;
    amountToFulFill?: number;
    buffer?: number;
    repeating?: boolean;
    from?: string;
    to?: string;
};

interface Props {
    onChange: (changedConditions: ConditionsObject) => void;
}

export default function ConditionsTab({ onChange }: Props) {
    const [conditionsInfo, setConditionsInfo] = useState<ConditionsObject>({
        type: 'unlimited'
    });

    return <></>;
}
