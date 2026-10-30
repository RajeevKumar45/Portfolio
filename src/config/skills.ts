import { site } from './site';

/** Where a skill group was used: a project id from projects.ts, or an external link. */
export type SkillEvidence = { projectId: string } | { label: string; href: string };

export interface SkillGroup {
  id: string;
  title: string;
  icon: 'languages' | 'frontend' | 'backend' | 'databases' | 'ai' | 'tools';
  skills: string[];
  evidence: SkillEvidence[];
  note?: string;
}

/**
 * Only technologies found in code in the public repositories are listed here.
 * Candidate skills without repository evidence (C, Java, MySQL, VS Code) are
 * intentionally left out; add them once a project or other proof supports them.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    title: 'Programming Languages',
    icon: 'languages',
    skills: ['Python', 'JavaScript', 'TypeScript', 'C++'],
    evidence: [
      { projectId: 'typeforge-ai' },
      { projectId: 'medicine-explorer' },
      { projectId: 'talkbridge-ai' },
      { label: 'LeetCode', href: site.links.leetcode },
    ],
    note: 'C++ is the language I use for problem solving on LeetCode.',
  },
  {
    id: 'frontend',
    title: 'Frontend Development',
    icon: 'frontend',
    skills: ['HTML', 'CSS', 'React', 'Tailwind CSS'],
    evidence: [{ projectId: 'typeforge-ai' }, { projectId: 'forgeweb' }, { projectId: 'talkbridge-ai' }],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    icon: 'backend',
    skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs'],
    evidence: [{ projectId: 'typeforge-ai' }, { projectId: 'medicine-explorer' }],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: 'databases',
    skills: ['MongoDB', 'SQLite'],
    evidence: [{ projectId: 'typeforge-ai' }, { projectId: 'medicine-explorer' }],
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    icon: 'ai',
    skills: ['Gemini API', 'scikit-learn'],
    evidence: [
      { projectId: 'forgeweb' },
      { projectId: 'medicine-explorer' },
      { label: 'FarmQuest', href: 'https://github.com/rajeevkumar-05/farmquest' },
    ],
  },
  {
    id: 'tools',
    title: 'Developer Tools',
    icon: 'tools',
    skills: ['Git', 'GitHub', 'Vite', 'Docker', 'GitHub Actions'],
    evidence: [{ projectId: 'typeforge-ai' }, { projectId: 'medicine-explorer' }],
  },
];

/** Fields being explored. These are interests, not proficiency claims. */
export const interests = [
  'Artificial Intelligence',
  'Machine Learning',
  'Full-Stack Development',
  'Data Structures and Algorithms',
  'Developer Tools',
  'Software Architecture',
];
