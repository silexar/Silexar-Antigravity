import { useEffect } from 'react';

type KeyCombo = string; // e.g., "ctrl+s", "enter", "shift+arrowright"

interface ShortcutConfig {
    combo: KeyCombo;
    handler: (e: KeyboardEvent) => void;
    description?: string;
    preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const pressedKeys: string[] = [];
            if (event.ctrlKey) pressedKeys.push('ctrl');
            if (event.altKey) pressedKeys.push('alt');
            if (event.shiftKey) pressedKeys.push('shift');
            if (event.metaKey) pressedKeys.push('meta');
            pressedKeys.push(event.key.toLowerCase());

            const comboString = pressedKeys.join('+');

            const match = shortcuts.find(s => s.combo.toLowerCase() === comboString);

            if (match) {
                if (match.preventDefault !== false) {
                    event.preventDefault();
                }
                match.handler(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
};
