import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useCourses from '../hooks/useCourses';
import { getCourses } from '../features/modals/library/coursesApi';
import educationData from '../features/modals/library/educationData';
import { sortCoursesByRecency } from '../features/modals/library/coursesApi';

vi.mock('../features/modals/library/coursesApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getCourses: vi.fn(),
}));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const CACHE_KEY = 'courses_api_cache_v1'; // stessa chiave dell'hook

const apiCourse = { id: 7, course: 'Corso', description: 'D', certificate: '', organization: 'Ente', organizationUrl: '', period: 'P', skills: [], highlights: [], modules: [], projects: [] };

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useCourses', () => {
    it("carica i corsi dall'API e li salva in cache", async () => {
        getCourses.mockResolvedValue([apiCourse]);

        const { result } = renderHook(() => useCourses());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.courses[0].id).toBe(7);
        expect(result.current.error).toBeNull();
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it("con cache valida non chiama l'API", async () => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [{ id: 1, course: 'Cache' }], expiry: Date.now() + 60_000 }));

        const { result } = renderHook(() => useCourses());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.courses[0].course).toBe('Cache');
        expect(getCourses).not.toHaveBeenCalled();
    });

    it("se l'API fallisce e non c'è cache usa educationData.js", async () => {
        getCourses.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useCourses());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.courses).toEqual(sortCoursesByRecency(educationData));
        expect(result.current.error).toBe('Impossibile caricare la formazione.');
    });
});
