import type { Project } from '../types/project';
import forgewebPreview from '../assets/projects/forgeweb.webp';
import typeforgePreview from '../assets/projects/typeforge-ai.webp';
import talkbridgePreview from '../assets/projects/talkbridge-ai.webp';
import medicineExplorerPreview from '../assets/projects/medicine-explorer.webp';

/**
 * Every project card is generated from this list.
 *
 * - Add a project: copy an entry, give it a unique `id`, and edit the fields.
 * - Remove a project: delete its entry.
 * - Change status: 'Under Consideration' | 'In Development' | 'Completed'.
 * - Add a live demo: set `liveDemoUrl` to the deployed URL (keep `null` otherwise).
 * - Order: featured projects first, then the rest, in the order listed here.
 *
 * Descriptions were written from each repository's README and source code on
 * 29 Oct 2026. Only implemented features are listed as highlights.
 */
export const projects: Project[] = [
  {
    id: 'forgeweb',
    name: 'ForgeWeb',
    category: 'AI-assisted developer tool',
    summary: 'Architecture-first full-stack application generator',
    description:
      'An AI-assisted, architecture-first application generator. ForgeWeb turns a product description into reviewable requirements and an architecture plan, waits for explicit approval, and only then generates a React and TypeScript frontend with a contract-matched Python FastAPI backend.',
    highlights: [
      'Approval gate enforced by the backend state machine: no source files exist until the plan is confirmed.',
      'Staged generation across Gemini, Groq, and OpenRouter with bounded retries and explicit provider-failure reporting.',
      'Persistent workspace with version snapshots, restore, a sandboxed preview, and validation-gated ZIP export.',
    ],
    role: null,
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Gemini API', 'Groq', 'OpenRouter'],
    // The repository name is spelled "ForegeWeb"; the product is named ForgeWeb in its README.
    githubUrl: 'https://github.com/rajeevkumar-05/ForegeWeb.git',
    repositoryVerified: true,
    liveDemoUrl: null,
    // Confirmed by Rajeev on 30 Oct 2026: actively being developed.
    status: 'In Development',
    featured: true,
    teamProject: true,
    note: 'Active prototype. Generated applications still need review and testing before production use.',
    image: {
      src: forgewebPreview,
      alt: 'ForgeWeb start screen: a prompt composer asking to build a secure client portal, with a "Forge this idea" button.',
      width: 1000,
      height: 625,
    },
  },
  {
    id: 'codelens',
    name: 'CodeLens',
    category: null,
    summary: null,
    description:
      'A software development project currently under consideration. Project details and implementation scope will be updated as development progresses.',
    highlights: [],
    role: null,
    technologies: [],
    // Not verified: on 29 Oct 2026 this URL returned HTTP 404 (private, renamed, or not yet created).
    // Set repositoryVerified to true once the repository is public.
    githubUrl: 'https://github.com/rajeevkumar-05/CodeLens.git',
    repositoryVerified: false,
    liveDemoUrl: null,
    status: 'Under Consideration',
    featured: true,
    teamProject: false,
    note: null,
    image: null,
  },
  {
    id: 'typeforge-ai',
    name: 'TypeForge AI',
    category: 'Full-stack web app',
    summary: 'Typing practice platform',
    description:
      'A full-stack typing-practice platform. A real-time typing engine measures speed and accuracy as you type, and signed-in users can save results, follow their progress on a personal dashboard, and compare scores on leaderboards.',
    highlights: [
      'Timed and word-count tests, a zen mode, punctuation and number toggles, and three themes.',
      'Email/password and Google OAuth sign-in with JWT authentication and email-based password reset.',
      'Express and MongoDB API for saved results, statistics, and time-period leaderboards.',
    ],
    role: null,
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Passport.js'],
    githubUrl: 'https://github.com/rajeevkumar-05/typeforge-ai',
    repositoryVerified: true,
    liveDemoUrl: 'https://typeforge-ai-frontend.vercel.app',
    // Inferred from recent commits; confirm and update as needed.
    status: 'In Development',
    featured: false,
    teamProject: false,
    note: null,
    image: {
      src: typeforgePreview,
      alt: 'TypeForge AI typing test with punctuation, numbers, time, words, and zen controls above a block of practice words.',
      width: 1200,
      height: 750,
    },
  },
  {
    id: 'talkbridge-ai',
    name: 'TalkBridge AI',
    category: 'AI · Speech and translation',
    summary: 'Real-time voice translation calls',
    description:
      'A voice translation calling app for English, Hindi, and Kannada. Two callers join a shared room and speak in their own language; the app shows live subtitles and plays the translation to the other person in a neural voice.',
    highlights: [
      'Browser speech recognition feeds a FastAPI translation endpoint that uses MarianMT, with optional Gemini refinement, and returns neural text-to-speech audio.',
      'WebSocket room signaling relays live transcripts and translated audio between the two callers.',
      'Backend audio pipeline with voice-activity detection and Whisper speech recognition for uploaded or streamed audio.',
    ],
    role: 'Redesigned the front end into a responsive three-column call workspace with live subtitles, clearer status indicators, and keyboard and screen-reader improvements.',
    technologies: ['Python', 'FastAPI', 'WebSockets', 'Web Speech API', 'MarianMT', 'Whisper', 'Gemini API', 'JavaScript'],
    githubUrl: 'https://github.com/rajeevkumar-05/realtime-voice-translation-calls',
    repositoryVerified: true,
    liveDemoUrl: null,
    // Inferred from recent commits; confirm and update as needed.
    status: 'In Development',
    featured: false,
    teamProject: true,
    note: 'Runs locally; no public deployment.',
    image: {
      src: talkbridgePreview,
      alt: 'TalkBridge AI call workspace with the live voice stage, word-by-word subtitles, call controls, and the translation pipeline panel.',
      width: 1014,
      height: 634,
    },
  },
  {
    id: 'medicine-explorer',
    name: 'Medicine Explorer',
    category: 'Python · Data and ML',
    summary: 'Educational medicine-catalogue explorer',
    description:
      'An educational medicine-catalogue explorer, rebuilt as the successor to an earlier side-effect predictor. It helps people find, compare, and read recorded medicine information, and it deliberately does not calculate personal medical risk.',
    highlights: [
      'Streamlit app with SQLite full-text search, RapidFuzz name matching, record comparison, and voice or package-photo (OCR) lookup.',
      'Read-only FastAPI service, optional accounts with bcrypt-hashed passwords, cached DailyMed label references, and Docker Compose.',
      'CI on Ubuntu and Windows runs the unit tests; an offline scikit-learn experiment explores label suggestion with grouped evaluation.',
    ],
    role: null,
    technologies: ['Python', 'Streamlit', 'FastAPI', 'SQLite', 'scikit-learn', 'Docker', 'GitHub Actions'],
    githubUrl: 'https://github.com/rajeevkumar-05/Drug-Side-Effect-Risk-Predictor',
    repositoryVerified: true,
    liveDemoUrl: null,
    // Inferred from recent commits; confirm and update as needed.
    status: 'In Development',
    featured: false,
    teamProject: false,
    note: 'Educational tool, not medical advice.',
    image: {
      src: medicineExplorerPreview,
      alt: 'Medicine Explorer home screen with catalogue search by medicine, ingredient, or manufacturer and quick-start shortcuts.',
      width: 1280,
      height: 800,
    },
  },
];

export const featuredProjects = projects.filter((project) => project.featured);
export const otherProjects = projects.filter((project) => !project.featured);

export function findProject(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}
