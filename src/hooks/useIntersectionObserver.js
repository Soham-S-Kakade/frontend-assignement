import { useState, useEffect, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const target = targetRef.current;
        if (!target) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting) {
                    setHasIntersected(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, [options]);

    return { targetRef, isIntersecting, hasIntersected };
}

export function useIntersectionObserverList(options = {}) {
    const [entries, setEntries] = useState([]);
    const observerRef = useRef(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (observerEntries) => {
                setEntries(observerEntries);
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [options]);

    const observe = (element) => {
        if (observerRef.current && element) {
            observerRef.current.observe(element);
        }
    };

    const unobserve = (element) => {
        if (observerRef.current && element) {
            observerRef.current.unobserve(element);
        }
    };

    return { observe, unobserve, entries };
}