import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useCertifications from '../hooks/useCertifications';
import { getCertifications } from '../features/modals/certifications/certificationsApi';
import certificationData from '../features/modals/certifications/certificationData';

vi.mock('../features/modals/certifications/certificationsApi', async (importOriginal) => ({
    ...(await importOriginal()),
    getCertifications: vi.fn(),
}));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const CACHE_KEY = 'certifications_api_cache_v1'; // stessa chiave dell'hook

const apiCertification = { id: 5, title: 'T', preview: '/modals/certifications/x.webp', organization: 'O', organizationUrl: '', skills: [], courseId: 3 };

beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useCertifications', () => {
    it("carica gli attestati dall'API, li mappa e li salva in cache", async () => {
        getCertifications.mockResolvedValue([apiCertification]);

        const { result } = renderHook(() => useCertifications());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.certifications[0].preview).toBe('/assets/modals/certifications/x.webp');
        expect(result.current.certifications[0].courseId).toBe(3);
        expect(JSON.parse(localStorage.getItem(CACHE_KEY)).data).toHaveLength(1);
    });

    it("con cache valida non chiama l'API", async () => {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [{ id: 1, title: 'Cache' }], expiry: Date.now() + 60_000 }));

        const { result } = renderHook(() => useCertifications());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.certifications[0].title).toBe('Cache');
        expect(getCertifications).not.toHaveBeenCalled();
    });

    it("se l'API fallisce e non c'è cache usa certificationData.js", async () => {
        getCertifications.mockRejectedValue(new Error('down'));

        const { result } = renderHook(() => useCertifications());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.certifications).toEqual(certificationData);
        expect(result.current.error).toBe('Impossibile caricare le certificazioni.');
    });
});
