/**
 * The three supported project statuses. Use these exact strings in
 * `src/config/projects.ts`; the badge styling is derived from them.
 */
export const PROJECT_STATUSES = ['Under Consideration', 'In Development', 'Completed'] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface ProjectImage {
  /** Imported image module (keeps hashing and base paths correct). */
  src: string;
  /** Describe what the screenshot shows, not just the project name. */
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  /** Unique, URL-safe id. Also used for the card anchor: #project-<id>. */
  id: string;
  name: string;
  /** Short category label shown above the project name. */
  category: string | null;
  /** Optional one-line summary shown under the project name. */
  summary: string | null;
  /**
   * Accurate description of what exists today. If left empty, the GitHub
   * repository description is used when it can be loaded.
   */
  description: string;
  /** Implemented features only. Keep proposed or planned work out of this list. */
  highlights: string[];
  /** Your personal contribution, recommended for team projects. */
  role: string | null;
  technologies: string[];
  /** Repository URL, used exactly as written. */
  githubUrl: string;
  /**
   * Set to `true` only after confirming the repository is publicly reachable.
   * When `false`, the card shows "Repository not public yet" instead of a link
   * that would lead to a 404. If the live GitHub check finds the repository,
   * the link is enabled automatically.
   */
  repositoryVerified: boolean;
  /** `null` unless a working deployment has been verified. */
  liveDemoUrl: string | null;
  status: ProjectStatus;
  /** Featured projects get the large layout at the top of the section. */
  featured: boolean;
  /** Shows a "Team project" label. */
  teamProject: boolean;
  /** Short scope or limitation note, shown in small text. */
  note: string | null;
  image: ProjectImage | null;
}
