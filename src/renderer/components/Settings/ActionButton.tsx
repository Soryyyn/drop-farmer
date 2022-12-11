import Tooltip from "@components/global/Tooltip";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface Props {
    icon: IconDefinition;
    tooltip?: string;
    onClick: () => void;
}

export function ActionButton({ icon, tooltip, onClick }: Props) {
    return (
        <>
            {tooltip ? (
                <Tooltip tooltipText={tooltip} placement="bottom">
                    <div
                        className="flex justify-center items-center aspect-square bg-pepper-700 hover:bg-pepper-800 rounded-md p-2.5"
                        onClick={onClick}
                    >
                        <FontAwesomeIcon
                            fixedWidth={true}
                            icon={icon}
                            size="1x"
                            className="text-snow-500"
                        />
                    </div>
                </Tooltip>
            ) : (
                <div
                    className="flex justify-center items-center aspect-square bg-pepper-700 hover:bg-pepper-800 rounded-md p-2.5"
                    onClick={onClick}
                >
                    <FontAwesomeIcon
                        fixedWidth={true}
                        icon={icon}
                        size="1x"
                        className="text-snow-500"
                    />
                </div>
            )}
        </>
    );
}
