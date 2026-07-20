import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutMeModal from '../features/modals/about/AboutMeModal';

describe('AboutMeModal', () => {
    it('renders greeting', () => {
        render(<AboutMeModal />);
        expect(screen.getByText('Ciao sono Mirko')).toBeInTheDocument();
    });

    it('renders multiple paragraphs about Mirko', () => {
        render(<AboutMeModal />);
        expect(screen.getByText(/sviluppatore web/)).toBeInTheDocument();
        expect(screen.getByText(/soft skills/)).toBeInTheDocument();
        expect(screen.getByText(/videogiochi/)).toBeInTheDocument();
        expect(screen.getByText(/manga/)).toBeInTheDocument();
    });

    it('renders curriculum image button', () => {
        render(<AboutMeModal />);
        const images = screen.getAllByRole('img');
        const curriculumSprites = images.filter(img => img.getAttribute('alt') === 'bottom sprite' || img.closest('button'));
        expect(curriculumSprites.length).toBeGreaterThanOrEqual(1);
    });

    it('renders top angle image', () => {
        render(<AboutMeModal />);
        expect(screen.getByAltText('top angle')).toBeInTheDocument();
    });

    it('renders intro paragraph with text informatica', () => {
        render(<AboutMeModal />);
        expect(screen.getByText(/Informatica/i)).toBeInTheDocument();
    });

    it('renders hobby paragraph', () => {
        render(<AboutMeModal />);
        expect(screen.getByText(/palestra/)).toBeInTheDocument();
    });
});