import { FarmRendererData, FarmStatus } from '@df-types/farms.types';

/**
 * Farm status sorted by their priority.
 */
const statusPriority: Record<FarmStatus, number> = {
    'disabled': 1,
    'idle': 2,
    'condition-fulfilled': 3,
    'checking': 4,
    'farming': 5,
    'attention-required': 6
};

/**
 * Sort the farms given by their priority.
 */
export function sortFarmsByStatus(
    farms: FarmRendererData[]
): FarmRendererData[] {
    return farms.sort(
        (first, second) =>
            statusPriority[second.status] - statusPriority[first.status]
    );
}
