import { memo } from 'react';
import styles from '../ProjectsModal.module.css';

const FilterGroup = memo(function FilterGroup({ options, name, selectedValue, onChange }) {
    return (
        <fieldset className={styles['filter-wrapper']}>
            {options.map(({ id, value, content }) => {
                const inputId = `${name}-${id}`;
                return (
                    <span key={inputId}>
                        <input
                            type="radio"
                            className={styles['visually-hidden']}
                            id={inputId}
                            name={name}
                            value={value}
                            checked={selectedValue === value}
                            onChange={event => onChange(event.target.value)}
                        />
                        <label
                            htmlFor={inputId}
                            className={`${styles['button-label']} ${selectedValue === value ? styles['selected-filter'] : ''}`}
                        >
                            {content}
                        </label>
                    </span>
                );
            })}
        </fieldset>
    );
});

export default FilterGroup;
