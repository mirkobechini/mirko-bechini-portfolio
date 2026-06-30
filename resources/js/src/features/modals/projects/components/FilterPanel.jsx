import { memo } from 'react';
import styles from '../ProjectsModal.module.css';

const FilterPanel = memo(function FilterPanel({
    children,
    onBack,
    backLabel,
    onReset,
    resetLabel,
    resetIcon,
    isMobileOpen,
    onShowMobile,
    onHideMobile,
    showLabel,
    hideLabel,
    mobileIcon,
}) {
    return (
        <>
            <div className={`${styles['filter-container']} ${isMobileOpen ? styles['is-open-mobile'] : ''}`}>
                {onBack && (
                    <button type="button" className={styles['back-button']} onClick={onBack} aria-label={backLabel}>
                        <svg className={styles['back-arrow']} viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#e8c879" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span>{backLabel}</span>
                    </button>
                )}
                <div className={styles['filter-group']}>
                    {children}
                </div>
                {onReset && (
                    <button className={styles['filter-button']} onClick={onReset} type="button">
                        <img src={resetIcon} alt={resetLabel} width="499" height="141" />
                        <span className={styles['filter-button-text']}>{resetLabel}</span>
                    </button>
                )}

                {onHideMobile && (
                    <button className={`${styles['filter-button']} ${styles['close-filters-btn']}`} onClick={onHideMobile} type="button">
                        <img src={mobileIcon} alt={hideLabel} width="85" height="85" />
                        <span className={styles['filter-button-text']}>{hideLabel}</span>
                    </button>
                )}
            </div>

            {onShowMobile && (
                <button className={`${styles['filter-button']} ${styles['mobile-trigger-btn']}`} onClick={onShowMobile} type="button">
                    <img src={mobileIcon} alt={showLabel} width="85" height="85" />
                    <span className={styles['filter-button-text']}>{showLabel}</span>
                </button>
            )}
        </>
    );
});

export default FilterPanel;
