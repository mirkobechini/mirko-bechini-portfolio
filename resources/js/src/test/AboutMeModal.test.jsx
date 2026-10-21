import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutMeModal from '../features/modals/about/AboutMeModal';
import { getAbout } from '../features/modals/about/aboutApi';
import aboutData from '../features/modals/about/aboutData';

vi.mock('../features/modals/about/aboutApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getAbout: vi.fn(),
}));

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    getAbout.mockResolvedValue(aboutData); // l'API risponde con lo stesso testo di riserva
});

describe('AboutMeModal', () => {
    it('renders greeting', async () => {
        render(<AboutMeModal />);
        expect(await screen.findByText('Ciao sono Mirko')).toBeInTheDocument();
    });

    it("mostra il testo scritto dal pannello", async () => {
        getAbout.mockResolvedValue([{ title: 'Titolo dal pannello', paragraphs: ['Primo blocco.', 'Secondo blocco.'] }]);
        render(<AboutMeModal />);

        expect(await screen.findByText('Titolo dal pannello')).toBeInTheDocument();
        expect(screen.getByText('Primo blocco.')).toBeInTheDocument();
        expect(screen.getByText('Secondo blocco.')).toBeInTheDocument();
        expect(screen.queryByText('Ciao sono Mirko')).not.toBeInTheDocument();
    });

    it("se l'API non risponde mostra il testo di riserva", async () => {
        vi.spyOn(console, 'error').mockImplementation(() => { });
        getAbout.mockRejectedValue(new Error('down'));
        render(<AboutMeModal />);

        expect(await screen.findByText('Ciao sono Mirko')).toBeInTheDocument();
    });

    it('renders multiple paragraphs about Mirko', async () => {
        render(<AboutMeModal />);
        expect(await screen.findByText(/sviluppatore web/)).toBeInTheDocument();
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

    it('renders intro paragraph with text informatica', async () => {
        render(<AboutMeModal />);
        expect(await screen.findByText(/Informatica/i)).toBeInTheDocument();
    });

    it('renders hobby paragraph', async () => {
        render(<AboutMeModal />);
        expect(await screen.findByText(/palestra/)).toBeInTheDocument();
    });

    describe('curriculum', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('apre il PDF del curriculum in una nuova scheda al click', async () => {
            const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
            const user = userEvent.setup();
            render(<AboutMeModal />);

            await user.click(screen.getByRole('button'));

            expect(openSpy).toHaveBeenCalledTimes(1);
            expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('Bechini-Mirko_CV.pdf'), '_blank');
        });
    });
});
