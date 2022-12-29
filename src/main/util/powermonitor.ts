import { powerMonitor } from 'electron';
import { EventChannels } from '../common/constants';
import { emitEvent } from './events';
import { log } from './logger';

/**
 * Listen for suspend and resume events, to pause the farms to prevent errors.
 * If the pc is going to sleep, then no need to farm.
 *
 * Maybe add a setting in the future to prevent the pc from going to sleep?
 */
export function initPowermonitor() {
    powerMonitor.on('suspend', () => {
        log('MAIN', 'INFO', 'PC went to sleep');
        emitEvent(EventChannels.PCWentToSleep);
    });

    powerMonitor.on('resume', () => {
        log('MAIN', 'INFO', 'PC woke up');
        emitEvent(EventChannels.PCWokeUp);
    });
}
