import { useState, useEffect } from 'react';

function useLocalStorageState<T>(key: string, initialValue: T) {
    // Get the initial state from localStorage or use the provided initial value
    const [state, setState] = useState<T>(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? JSON.parse(storedValue) : initialValue;
    });

    // Update localStorage whenever the state changes
    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState] as const; // Return a tuple
}

export default useLocalStorageState;
