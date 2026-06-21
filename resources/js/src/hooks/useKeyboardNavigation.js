import { useEffect } from 'react';

/**
 * @param {object} options
 * @param {number} options.currentIndex - Indice corrente (0-based), -1 se nessuno selezionato
 * @param {(nextIndex: number) => void} options.onNavigate - Callback quando l'indice cambia
 * @param {number} options.totalItems - Numero totale di elementi navigabili
 * @param {'linear' | 'grid'} options.mode - 'linear' (su/giu = prev/next) o 'grid' (navigazione 2D)
 * @param {number} [options.columns] - Numero di colonne (obbligatorio se mode='grid')
 * @param {boolean} [options.enabled] - Se la navigazione è attiva
 */
export function useKeyboardNavigation({
    currentIndex,
    onNavigate,
    totalItems,
    mode = 'linear',
    columns = 1,
    enabled = true,
}) {
    useEffect(() => {
        if (!enabled || totalItems === 0) return;

        function isTypingTarget(el) {
            if (!el) return false;
            const tag = el.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
        }

        function getNextIndex(currentIdx, key) {
            if (totalItems === 0) return -1;

            if (mode === 'grid') {
                return getGridNextIndex(currentIdx, key, totalItems, columns);
            }

            // Linear navigation
            if (currentIdx < 0) {
                return key === 'ArrowLeft' || key === 'ArrowUp' ? totalItems - 1 : 0;
            }

            switch (key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    return (currentIdx + 1) % totalItems;
                case 'ArrowLeft':
                case 'ArrowUp':
                    return (currentIdx - 1 + totalItems) % totalItems;
                default:
                    return currentIdx;
            }
        }

        function handleKeyDown(event) {
            const arrowKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!arrowKeys.includes(event.key)) return;

            if (isTypingTarget(document.activeElement)) return;

            event.preventDefault();

            const nextIndex = getNextIndex(currentIndex, event.key);
            if (nextIndex >= 0 && nextIndex !== currentIndex) {
                onNavigate(nextIndex);
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onNavigate, totalItems, mode, columns, enabled]);
}

function getGridNextIndex(currentIdx, key, totalItems, columns) {
    if (totalItems === 0) return -1;

    if (currentIdx < 0) {
        return key === 'ArrowLeft' || key === 'ArrowUp' ? totalItems - 1 : 0;
    }

    switch (key) {
        case 'ArrowRight':
            return (currentIdx + 1) % totalItems;
        case 'ArrowLeft':
            return (currentIdx - 1 + totalItems) % totalItems;
        case 'ArrowDown': {
            const rowJump = currentIdx + columns;
            if (rowJump < totalItems) return rowJump;

            const sameColumnFirstRow = currentIdx % columns;
            return sameColumnFirstRow < totalItems ? sameColumnFirstRow : totalItems - 1;
        }
        case 'ArrowUp': {
            const rowJump = currentIdx - columns;
            if (rowJump >= 0) return rowJump;

            const currentColumn = currentIdx % columns;
            const lastIndexInColumn = totalItems - 1 - ((totalItems - 1 - currentColumn) % columns);
            return lastIndexInColumn;
        }
        default:
            return currentIdx;
    }
}
