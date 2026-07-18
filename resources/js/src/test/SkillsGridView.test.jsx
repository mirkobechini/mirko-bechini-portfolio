import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkillsGridView from '../features/modals/library/SkillsGridView';

const skillsData = [
    { id: 1, skill: 'HTML', icon: '/html.webp', color: '#E34F26' },
    { id: 2, skill: 'CSS', icon: '/css.webp', color: '#1572B6' },
    { id: 3, skill: 'JS', icon: '/js.webp', color: '#F7DF1E' },
];

describe('SkillsGridView', () => {
    it('renders title', () => {
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={null}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
            />
        );
        expect(screen.getByText('Competenze')).toBeInTheDocument();
    });

    it('renders all skill cards', () => {
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={null}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
            />
        );
        const buttons = screen.getAllByRole('button', { name: /Apri dettagli skill/i });
        expect(buttons).toHaveLength(3);
    });

    it('calls onSkillClick when a card is clicked', async () => {
        const user = userEvent.setup();
        const onSkillClick = vi.fn();
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={null}
                skillCardRefs={{ current: [] }}
                onSkillClick={onSkillClick}
                title="Competenze"
            />
        );

        await user.click(screen.getByRole('button', { name: /Apri dettagli skill HTML/i }));
        expect(onSkillClick).toHaveBeenCalledWith(skillsData[0]);
    });

    it('applies selected class to current skill', () => {
        const { container } = render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={skillsData[1]}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
            />
        );

        const skillCard = container.querySelector('.selected-skill');
        expect(skillCard).not.toBeNull();
    });

    it('sets aria-pressed on selected skill', () => {
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={skillsData[0]}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
            />
        );

        const buttons = screen.getAllByRole('button', { pressed: true });
        expect(buttons).toHaveLength(1);
    });

    it('does not render back button when no returnToEducation', () => {
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={null}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
            />
        );
        expect(screen.queryByText('‹ Formazione')).not.toBeInTheDocument();
    });

    it('renders back to formation button when returnToEducation is provided', () => {
        render(
            <SkillsGridView
                skillsData={skillsData}
                currentSkill={null}
                skillCardRefs={{ current: [] }}
                onSkillClick={vi.fn()}
                title="Competenze"
                onBackToFormation={vi.fn()}
                returnToEducation={{ id: 1 }}
            />
        );
        expect(screen.getByText('‹ Formazione')).toBeInTheDocument();
    });
});