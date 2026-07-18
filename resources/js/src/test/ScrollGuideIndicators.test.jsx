import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ScrollGuideIndicators from '../components/ui/ScrollGuideIndicators';

describe('ScrollGuideIndicators', () => {
    it('renders two guide divs', () => {
        const { container } = render(<ScrollGuideIndicators />);

        const guides = container.querySelectorAll('.scroll-guide-left, .scroll-guide-right');
        expect(guides.length).toBe(2);
    });

    it('left guide has aria-hidden true', () => {
        const { container } = render(<ScrollGuideIndicators />);

        const left = container.querySelector('.scroll-guide-left');
        expect(left).toHaveAttribute('aria-hidden', 'true');
    });

    it('right guide has aria-hidden true', () => {
        const { container } = render(<ScrollGuideIndicators />);

        const right = container.querySelector('.scroll-guide-right');
        expect(right).toHaveAttribute('aria-hidden', 'true');
    });
});