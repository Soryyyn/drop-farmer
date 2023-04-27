import { useCallback, useEffect, useState } from 'react';

/**
 * Handle keypress events.
 */
export function useKeyPress(keyCode: string, preventDefault?: boolean) {
    const [pressed, setPressed] = useState(false);

    /**
     * Handle the key down event.
     */
    const keyDownHandler = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;

            if (preventDefault) {
                event.preventDefault();
            }

            if (key === keyCode) setPressed(true);
        },
        [keyCode, preventDefault]
    );

    /**
     * Handle the key up event.
     */
    const keyUpHandler = useCallback(
        (event: KeyboardEvent) => {
            const { key } = event;

            if (preventDefault) {
                event.preventDefault();
            }

            if (key === keyCode) setPressed(false);
        },
        [keyCode, preventDefault]
    );

    /**
     * React to the listeners.
     */
    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        window.addEventListener('keyup', keyUpHandler);

        return () => {
            window.removeEventListener('keydown', keyDownHandler);
            window.removeEventListener('keyup', keyUpHandler);
        };
    }, [keyDownHandler, keyUpHandler]);

    return pressed;
}
