import { describe, it, expect } from 'vitest';

// Mock getAssetPath per i moduli che lo importano
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

import aboutModalConfig from '../features/modals/about/aboutModalConfig';
import libraryModalConfig from '../features/modals/library/libraryModalConfig';
import projectsModalConfig from '../features/modals/projects/projectsModalConfig';
import certificationsModalConfig from '../features/modals/certifications/certificationsModalConfig';
import contactsModalConfig from '../features/modals/contacts/contactsModalConfig';

describe('aboutModalConfig', () => {
    it('has id 1', () => expect(aboutModalConfig.id).toBe(1));
    it('has title About Me', () => expect(aboutModalConfig.title).toBe('About Me'));
    it('has theme monkey', () => expect(aboutModalConfig.theme).toBe('monkey'));
    it('has componentKey aboutMe', () => expect(aboutModalConfig.componentKey).toBe('aboutMe'));
    it('has sprite null', () => expect(aboutModalConfig.sprite).toBeNull());
});

describe('libraryModalConfig', () => {
    it('has id 2', () => expect(libraryModalConfig.id).toBe(2));
    it('has title Formazione & Competenze', () => expect(libraryModalConfig.title).toBe('Formazione & Competenze'));
    it('has theme library', () => expect(libraryModalConfig.theme).toBe('library'));
    it('has componentKey bookshelf', () => expect(libraryModalConfig.componentKey).toBe('bookshelf'));
    it('has sprite path', () => expect(libraryModalConfig.sprite).toContain('/modals/bookshelf/books-monkey.webp'));
});

describe('projectsModalConfig', () => {
    it('has id 3', () => expect(projectsModalConfig.id).toBe(3));
    it('has title Esperienze & Progetti', () => expect(projectsModalConfig.title).toBe('Esperienze & Progetti'));
    it('has theme desk', () => expect(projectsModalConfig.theme).toBe('desk'));
    it('has componentKey projects', () => expect(projectsModalConfig.componentKey).toBe('projects'));
    it('has sprite path', () => expect(projectsModalConfig.sprite).toContain('/modals/projects/desk-modal.webp'));
});

describe('certificationsModalConfig', () => {
    it('has id 4', () => expect(certificationsModalConfig.id).toBe(4));
    it('has title Certificazioni', () => expect(certificationsModalConfig.title).toBe('Certificazioni'));
    it('has theme painting', () => expect(certificationsModalConfig.theme).toBe('painting'));
    it('has componentKey certifications', () => expect(certificationsModalConfig.componentKey).toBe('certifications'));
    it('has sprite path', () => expect(certificationsModalConfig.sprite).toContain('/modals/certifications/painting-modal.webp'));
});

describe('contactsModalConfig', () => {
    it('has id 5', () => expect(contactsModalConfig.id).toBe(5));
    it('has title Contatti', () => expect(contactsModalConfig.title).toBe('Contatti'));
    it('has theme parrot', () => expect(contactsModalConfig.theme).toBe('parrot'));
    it('has componentKey contacts', () => expect(contactsModalConfig.componentKey).toBe('contacts'));
    it('has sprite path', () => expect(contactsModalConfig.sprite).toContain('/modals/contacts/parrot-modal.webp'));
});