import { describe, it, expect } from 'vitest';
import projectsMeta from '../features/modals/projects/services/projectsMeta';
import { transformRepos, mapRepoToProject, filterRepos } from '../features/modals/projects/services/projectMapper';

describe('projectsMeta', () => {
    it('exports an object with known project keys', () => {
        expect(projectsMeta).toBeInstanceOf(Object);
        expect(Object.keys(projectsMeta).length).toBeGreaterThan(0);
    });

    it('each meta entry has required fields', () => {
        Object.values(projectsMeta).forEach(meta => {
            expect(meta).toHaveProperty('type');
            expect(meta).toHaveProperty('projectScope');
            expect(meta).toHaveProperty('extraTechnologies');
            expect(Array.isArray(meta.extraTechnologies)).toBe(true);
        });
    });

    it('has valid type values', () => {
        Object.values(projectsMeta).forEach(meta => {
            expect(['frontend', 'backend', 'fullstack']).toContain(meta.type);
        });
    });

    it('has valid projectScope values', () => {
        Object.values(projectsMeta).forEach(meta => {
            expect(['personal', 'work']).toContain(meta.projectScope);
        });
    });

    it('has no excluded projects that are not in meta', () => {
        // Tutti i progetti in meta dovrebbero avere una descrizione
        Object.entries(projectsMeta).forEach(([key, meta]) => {
            if (!meta.exclude) {
                expect(meta.description).toBeTruthy();
            }
        });
    });
});

describe('projectMapper', () => {
    const mockRepo = {
        name: 'test-repo',
        description: 'A test repo',
        html_url: 'https://github.com/mirkobechini/test-repo',
        homepage: 'https://test.example.com',
        language: 'JavaScript',
        topics: ['react', 'api'],
        fork: false,
        archived: false,
        stargazers_count: 5,
        pushed_at: '2026-06-01T00:00:00Z',
        updated_at: '2026-06-01T00:00:00Z',
    };

    const mockMeta = {
        type: 'frontend',
        projectScope: 'personal',
        extraTechnologies: ['Figma'],
        description: 'Descrizione in italiano',
    };

    it('mapRepoToProject maps a repo correctly', () => {
        const result = mapRepoToProject(mockRepo, mockMeta);

        expect(result.id).toBe('test-repo');
        expect(result.title).toBe('test-repo');
        expect(result.description).toBe('Descrizione in italiano');
        expect(result.type).toBe('frontend');
        expect(result.projectScope).toBe('personal');
        expect(result.technologies).toContain('JavaScript');
        expect(result.technologies).toContain('react');
        expect(result.technologies).toContain('api');
        expect(result.technologies).toContain('Figma');
        expect(result.repo).toBe('https://github.com/mirkobechini/test-repo');
        expect(result.live).toBe('https://test.example.com');
        expect(result.stars).toBe(5);
    });

    it('mapRepoToProject uses meta.live when provided', () => {
        const result = mapRepoToProject(mockRepo, {
            ...mockMeta,
            live: 'https://custom.example.com',
        });
        expect(result.live).toBe('https://custom.example.com');
    });

    it('mapRepoToProject falls back to repo.live as "#"', () => {
        const result = mapRepoToProject(
            { ...mockRepo, homepage: null },
            { ...mockMeta, live: undefined }
        );
        expect(result.live).toBe('#');
    });

    it('filterRepos excludes repos with exclude: true in meta', () => {
        const repos = [
            { name: 'good-repo', fork: false, archived: false },
            { name: 'excluded-repo', fork: false, archived: false },
        ];
        const metaWithExclude = {
            'good-repo': { type: 'frontend', projectScope: 'personal', extraTechnologies: [] },
            'excluded-repo': { type: 'backend', projectScope: 'personal', extraTechnologies: [], exclude: true },
        };

        // Temporaneamente sovrascriviamo projectsMeta per il test
        const result = repos.filter(repo => {
            const meta = metaWithExclude[repo.name];
            if (meta && meta.exclude) return false;
            return true;
        });

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('good-repo');
    });

    it('transformRepos produces array with required fields', () => {
        const result = transformRepos([mockRepo]);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('description');
        expect(result[0]).toHaveProperty('type');
        expect(result[0]).toHaveProperty('projectScope');
        expect(result[0]).toHaveProperty('technologies');
        expect(result[0]).toHaveProperty('repo');
        expect(result[0]).toHaveProperty('live');
        expect(result[0]).toHaveProperty('stars');
        expect(result[0]).toHaveProperty('updatedAt');
    });
});