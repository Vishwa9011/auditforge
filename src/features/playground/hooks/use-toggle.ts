import { useState } from 'react';

export function useToggle(initialValue: boolean = false) {
    const [value, setValue] = useState(initialValue);

    const toggle = (value?: boolean) => {
        setValue(currentValue => (typeof value === 'boolean' ? value : !currentValue));
    };

    return [value, toggle] as const;
}
