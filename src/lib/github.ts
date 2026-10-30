/**
 * Minimal, unauthenticated client for public GitHub repository data.
 *
 * - No tokens are used or required (60 requests per hour per visitor IP).
 * - Responses are cached in sessionStorage to avoid repeat requests.
 * - Every failure is typed so the UI can fall back to the curated config.
 */

export interface GitHubRepo {
  name: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string | null;
  fork: boolean;
  archived: boolean;
}

export interface GitHubSnapshot {
  repos: GitHubRepo[];
  /** False when the result hit the page limit, so absence proves nothing. */
  complete: boolean;
  fetchedAt: number;
}

export type GitHubErrorKind = 'rate-limited' | 'not-found' | 'network' | 'http' | 'invalid-response';

export class GitHubError extends Error {
  readonly kind: GitHubErrorKind;

  constructor(kind: GitHubErrorKind, message: string) {
    super(message);
    this.name = 'GitHubError';
    this.kind = kind;
  }
}

const API_ROOT = 'https://api.github.com';
const PER_PAGE = 100;
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 30 * 60 * 1000;

const cacheKey = (username: string) => `github-repos:v${CACHE_VERSION}:${username.toLowerCase()}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function parseRepo(value: unknown): GitHubRepo | null {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.html_url !== 'string') {
    return null;
  }
  return {
    name: value.name,
    htmlUrl: value.html_url,
    description: optionalString(value.description),
    language: optionalString(value.language),
    stars: typeof value.stargazers_count === 'number' ? value.stargazers_count : 0,
    pushedAt: optionalString(value.pushed_at),
    fork: value.fork === true,
    archived: value.archived === true,
  };
}

export function readCachedSnapshot(username: string): GitHubSnapshot | null {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(username));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed) ||
      typeof parsed.fetchedAt !== 'number' ||
      typeof parsed.complete !== 'boolean' ||
      !Array.isArray(parsed.repos) ||
      Date.now() - parsed.fetchedAt > CACHE_TTL_MS
    ) {
      return null;
    }
    const repos = parsed.repos.map(parseCachedRepo).filter((repo): repo is GitHubRepo => repo !== null);
    return { repos, complete: parsed.complete, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function parseCachedRepo(value: unknown): GitHubRepo | null {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.htmlUrl !== 'string') return null;
  return {
    name: value.name,
    htmlUrl: value.htmlUrl,
    description: optionalString(value.description),
    language: optionalString(value.language),
    stars: typeof value.stars === 'number' ? value.stars : 0,
    pushedAt: optionalString(value.pushedAt),
    fork: value.fork === true,
    archived: value.archived === true,
  };
}

function writeCachedSnapshot(username: string, snapshot: GitHubSnapshot): void {
  try {
    window.sessionStorage.setItem(cacheKey(username), JSON.stringify(snapshot));
  } catch {
    // Storage can be unavailable (private mode, quota). Caching is optional.
  }
}

export async function fetchPublicRepos(username: string, signal?: AbortSignal): Promise<GitHubSnapshot> {
  const cached = readCachedSnapshot(username);
  if (cached) return cached;

  const url = `${API_ROOT}/users/${encodeURIComponent(username)}/repos?per_page=${PER_PAGE}&sort=pushed&type=owner`;

  let response: Response;
  try {
    response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new GitHubError('network', 'GitHub could not be reached.');
  }

  if (response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) {
    throw new GitHubError('rate-limited', 'The GitHub API rate limit has been reached.');
  }
  if (response.status === 404) throw new GitHubError('not-found', 'GitHub user not found.');
  if (!response.ok) throw new GitHubError('http', `GitHub responded with HTTP ${response.status}.`);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new GitHubError('invalid-response', 'GitHub returned a response that is not valid JSON.');
  }
  if (!Array.isArray(payload)) {
    throw new GitHubError('invalid-response', 'GitHub returned an unexpected response shape.');
  }

  const snapshot: GitHubSnapshot = {
    repos: payload.map(parseRepo).filter((repo): repo is GitHubRepo => repo !== null),
    complete: payload.length < PER_PAGE,
    fetchedAt: Date.now(),
  };
  writeCachedSnapshot(username, snapshot);
  return snapshot;
}

/** Extracts owner and repository from https://github.com/owner/repo(.git) URLs. */
export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = /^https?:\/\/(?:www\.)?github\.com\/([^/\s?#]+)\/([^/\s?#]+?)(?:\.git)?\/?(?:[?#].*)?$/i.exec(url.trim());
  if (!match) return null;
  const [, owner, repo] = match;
  return owner && repo ? { owner, repo } : null;
}
