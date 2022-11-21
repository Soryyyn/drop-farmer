import { useEffect } from "react";

/**
 * Handle a click outside of a reference.
 *
 * @param {any} ref The reference to the element which will be checked if it is *not* clicked.
 * @param {() => void} callback The callback to execute
 * when the reference is not clicked.
 */
export function useOutsideAlterter(ref: any, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: any) {
            if (ref.current && !ref.current.contains(event.target)) callback();
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}
