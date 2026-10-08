import { useEffect, useRef, useState } from "react";

export function useClipboard() {
    const [copied, setCopied] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

    const copy = async (text, key) => {
        try {
            if (!navigator.clipboard?.writeText) return false;
            await navigator.clipboard.writeText(String(text));
            setCopied(key);
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => setCopied(null), 1800);
            return true;
        } catch {
            return false;
        }
    };

    return { copied, copy };
}