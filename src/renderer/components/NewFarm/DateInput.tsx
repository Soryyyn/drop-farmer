import { Icon } from '@components/global/Icon';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import RequiredIndicator from './RequiredIndicator';

interface Props {
    label: string;
    value: Date;
    required: boolean;
    onSelected: (selected: any) => void;
}

export default function DateInput({
    label,
    value,
    required,
    onSelected
}: Props) {
    const [displayingCalendar, setDisplayingCalendar] = useState(false);

    return (
        <div className="flex flex-col grow gap-2" key={label}>
            <div className="flex flex-row leading-none gap-1">
                <span className="text-snow-300">{label}</span>
                {required && <RequiredIndicator />}
            </div>

            <div
                className="w-full bg-pepper-700 px-2 py-1 rounded focus:outline-none hover:bg-pepper-800 focus:bg-pepper-800 text-snow-300 capitalize text-left h-[33.5px] flex flex-row items-center relative"
                onClick={() => setDisplayingCalendar(true)}
            >
                <span>{value.toString()}</span>
                <Icon sprite={faCalendarDays} size="sm" className="ml-auto" />

                {displayingCalendar && (
                    <Calendar
                        showFixedNumberOfWeeks={true}
                        minDetail="month"
                        className="absolute z-50 -top-1 left-0 -translate-y-full"
                    />
                )}
            </div>
        </div>
    );
}
