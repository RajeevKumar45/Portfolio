import { useEffect, useState } from 'react';
import {
  fetchPublicRepos,
  GitHubError,
  parseGitHubRepoUrl,
  readCachedSnapshot,
  type GitHubErrorKind,
  type GitHubRepo,
  type GitHubSnapshot,
} from '../lib/github';

export type GitHubState =
  | { status: 'loading' }
  | { status: 'success'; snapshot: GitHubSnapshot }
  | { status: 'error'; error: GitHubErrorKind };

/** Loads public repositories once per page view (cached for the session). */
export function useGitHubRepos(username: string): GitHubState {
  const [state, setState] = useState<GitHubState>(() => {
    const cached = readCachedSnapshot(username);
    return cached ? { status: 'success', snapshot: cached } : { status: 'loading' };
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicRepos(username, controller.signal)
      .then((snapshot) => {
        setState((previous) =>
          previous.status === 'success' && previous.snapshot.fetchedAt === snapshot.fetchedAt
            ? previous
            : { status: 'success', snapshot },
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', error: error instanceof GitHubError ? error.kind : 'network' });
      });
    return () => controller.abort();
  }, [username]);

  return state;
}

export interface RepoInsight {
  /** Whether the card may link to the repository. */
  availability: 'available' | 'unavailable';
  /** Live metadata, when the repository was found in the API response. */
  repo: GitHubRepo | null;
  loading: boolean;
}

/**
 * Combines the configured verification flag with live GitHub data.
 * Live data can confirm or rule out a repository; when it is unavailable,
 * the configured `repositoryVerified` value decides.
 */
export function getRepoInsight(
  githubUrl: string,
  repositoryVerified: boolean,
  state: GitHubState,
  username: string,
): RepoInsight {
  const configured: RepoInsight['availability'] = repositoryVerified ? 'available' : 'unavailable';
  const parsed = parseGitHubRepoUrl(githubUrl);

  if (!parsed || parsed.owner.toLowerCase() !== username.toLowerCase()) {
    return { availability: configured, repo: null, loading: false };
  }
  if (state.status === 'loading') return { availability: configured, repo: null, loading: true };
  if (state.status === 'error') return { availability: configured, repo: null, loading: false };

  const repo = state.snapshot.repos.find((item) => item.name.toLowerCase() === parsed.repo.toLowerCase()) ?? null;
  if (repo) return { availability: 'available', repo, loading: false };

  // Absence only counts when the list is complete and non-empty; an empty
  // response is treated as "no data" rather than proof that nothing exists.
  const trustworthy = state.snapshot.complete && state.snapshot.repos.length > 0;
  return { availability: trustworthy ? 'unavailable' : configured, repo: null, loading: false };
}

export interface ProfileSummary {
  repoCount: number;
  countIsExact: boolean;
  lastPushAt: string | null;
}

export function summarizeProfile(snapshot: GitHubSnapshot): ProfileSummary {
  let lastPushAt: string | null = null;
  for (const repo of snapshot.repos) {
    if (repo.pushedAt && (!lastPushAt || Date.parse(repo.pushedAt) > Date.parse(lastPushAt))) {
      lastPushAt = repo.pushedAt;
    }
  }
  return { repoCount: snapshot.repos.length, countIsExact: snapshot.complete, lastPushAt };
}
