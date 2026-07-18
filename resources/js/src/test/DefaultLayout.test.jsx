import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';

describe('DefaultLayout', () => {
    it('renders a main element', () => {
        const { container } = render(
            <MemoryRouter>
                <DefaultLayout />
            </MemoryRouter>
        );

        expect(container.querySelector('main')).toBeInTheDocument();
    });
});