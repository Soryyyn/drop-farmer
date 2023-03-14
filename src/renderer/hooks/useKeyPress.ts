import { useEffect, useState } from 'react';

/**
 * Handle keypress events.
 */
export function useKeyPress(keyCode: string, preventDefault?: boolean) {
    const [pressed, setPressed] = useState(false);

    /**
     * Handle the key down event.
     */
    function keyDownHandler(event: KeyboardEvent) {
        const { key } = event;

        if (preventDefault) {
            event.preventDefault();
        }

        if (key === keyCode) setPressed(true);
    }

    /**
     * Handle the key up event.
     */
    function keyUpHandler(event: KeyboardEvent) {
        const { key } = event;

        if (preventDefault) {
            event.preventDefault();
        }

        if (key === keyCode) setPressed(false);
    }

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
    }, []);

    return pressed;
}
