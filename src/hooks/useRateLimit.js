import {useCallback,  useRef, useState} from "react";

export function useRateLimit(max = 8, ms = 60000) {
    const h = useRef([]);
    const [left, setLeft]= useState(max);

    const check = useCallback(() => {
        const now = Date.now();

        h.current = h.current.filter(t => now - t < ms);
        if (h.current.length >= max) return false;

        h.current.push(now);
        setLeft(max - h.current.length);
        return true;
    }, [max, ms]);
    return {check, left};
}
