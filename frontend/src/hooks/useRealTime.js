import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useTimeAgo — Returns a live "time ago" string that auto-updates
 */
export function useTimeAgo(dateStr) {
    const getTimeAgo = useCallback(() => {
        if (!dateStr) return "";
        const now = new Date();
        const date = new Date(dateStr);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 10) return "just now";
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return date.toLocaleDateString();
    }, [dateStr]);

    const [timeAgo, setTimeAgo] = useState(getTimeAgo);

    useEffect(() => {
        setTimeAgo(getTimeAgo());
        const interval = setInterval(() => setTimeAgo(getTimeAgo()), 30000); // update every 30s
        return () => clearInterval(interval);
    }, [getTimeAgo]);

    return timeAgo;
}

/**
 * useAutoRefresh — Calls a function at a regular interval
 */
export function useAutoRefresh(callback, intervalMs = 30000, enabled = true) {
    const savedCallback = useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);

    useEffect(() => {
        if (!enabled) return;
        const id = setInterval(() => savedCallback.current(), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs, enabled]);
}

/**
 * useAnimatedNumber — Animates a number from 0 to target
 */
export function useAnimatedNumber(target, duration = 800) {
    const [value, setValue] = useState(0);
    const rafRef = useRef(null);

    useEffect(() => {
        if (target === 0) { setValue(0); return; }
        const start = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(startValue + (target - startValue) * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };

        rafRef.current = requestAnimationFrame(animate);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [target, duration]);

    return value;
}

/**
 * useLiveClock — Returns current date/time updating every second
 */
export function useLiveClock() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    return now;
}
