import { EventChannels } from '@main/common/constants';
import { powerMonitor } from 'electron';
import { emitEvent } from './events';
import { log } from './logging';

/**
 * Listen for suspend and resume events, to pause the farms to prevent errors.
 * If the pc is going to sleep, then no need to farm.
 *
 * Maybe add a setting in the future to prevent the pc from going to sleep?
 */
export function initPowermonitor() {
    powerMonitor.on('suspend', () => {
        log('info', 'PC went to sleep');
        emitEvent(EventChannels.PCWentToSleep);
    });

    powerMonitor.on('resume', () => {
        log('info', 'PC woke up');
        emitEvent(EventChannels.PCWokeUp);
    });

    log('info', 'Initialized powermonitor');
}
