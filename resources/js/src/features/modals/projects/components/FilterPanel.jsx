import { memo } from 'react';
import styles from '../ProjectsModal.module.css';

const FilterPanel = memo(function FilterPanel({
    children,
    onBack,
    backLabel,
    onReset,
    resetLabel,
    resetIcon,
    isOpen,
    onShow,
    onHide,
    showLabel,
    hideLabel,
    mobileIcon,
}) {
    const handleToggleFilters = () => {
        if (isOpen) {
            onHide?.();
        } else {
            onShow?.();
        }
    };

    const toggleLabel = isOpen ? hideLabel : showLabel;

    return (
        <>
            <div className={styles['filter-header']}>
                {onBack && (
                    <button type="button" className={styles['back-button']} onClick={onBack} aria-label={backLabel}>
                        <svg className={styles['back-arrow']} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e8c879" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span>{backLabel}</span>
                    </button>
                )}

                {(onShow || onHide) && (
                    <button
                        className={`${styles['filter-button']} ${styles['trigger-btn']}`}
                        onClick={handleToggleFilters}
                        type="button"
                        aria-pressed={isOpen}
                    >
                        <img src={mobileIcon} alt={toggleLabel} width="85" height="85" />
                        <span className={styles['filter-button-text']}>{toggleLabel}</span>
                    </button>
                )}
            </div>

            <div className={`${styles['filter-container']} ${isOpen ? styles['is-open'] : ''}`}>
                <div className={styles['filter-group']}>
                    {children}
                </div>
                {onReset && (
                    <button className={styles['filter-button']} onClick={onReset} type="button">
                        <img src={resetIcon} alt={resetLabel} width="499" height="141" />
                        <span className={styles['filter-button-text']}>{resetLabel}</span>
                    </button>
                )}
            </div>
        </>
    );
});

export default FilterPanel;
