// usePhiHotkey.js (or top of the same file)
import { useEffect } from "react";

export function usePhiHotkey(toggle) {
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.repeat) return; // avoid rapid toggles while key is held
            const t = e.target;
            if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

            // Cmd/Ctrl + Shift + H
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyH") {
                e.preventDefault();
                toggle();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [toggle]);
}
