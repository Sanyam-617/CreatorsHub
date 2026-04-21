import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, duration = 1200) {
    const [value, setValue] = useState(0);
    const raf = useRef(null);

    useEffect(() => {
        // Cancel any existing animation before starting a new one
        if (raf.current) cancelAnimationFrame(raf.current);

        const start = performance.now();
        const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) raf.current = requestAnimationFrame(animate);
        };
        raf.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return value;
}