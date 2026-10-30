import { featuredProjects, otherProjects } from '../../config/projects';
import { site } from '../../config/site';
import { useGitHubRepos } from '../../hooks/useGitHubRepos';
import { GitHubCallout } from '../projects/GitHubCallout';
import { ProjectCard } from '../projects/ProjectCard';
import { Reveal } from '../ui/Reveal';
import { SectionHeader } from '../ui/SectionHeader';

export function Projects() {
  const github = useGitHubRepos(site.githubUsername);
  // With an odd number of cards, the GitHub card fills the empty grid cell.
  const calloutInGrid = otherProjects.length % 2 === 1;

  return (
    <section id="projects" aria-labelledby="projects-title" className="section">
      <div className="shell">
        <Reveal>
          <SectionHeader
            eyebrow="Projects"
            title={
              <>
                Selected <em className="text-accent italic">Projects</em>
              </>
            }
            titleId="projects-title"
            description="A collection of projects exploring software development, intelligent applications, and practical engineering solutions."
          />
        </Reveal>

        {featuredProjects.length > 0 ? (
          <ul className="mt-14 grid grid-cols-1 gap-6">
            {featuredProjects.map((project) => (
              <li key={project.id} className="min-w-0">
                <Reveal>
                  <ProjectCard project={project} layout="featured" github={github} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : null}

        {otherProjects.length > 0 ? (
          <>
            <p className="eyebrow mt-20 mb-6 flex items-center gap-4">
              More projects
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </p>
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {otherProjects.map((project, index) => (
                <li key={project.id} className="min-w-0">
                  <Reveal className="h-full" delay={(index % 2) * 80}>
                    <ProjectCard project={project} layout="compact" github={github} />
                  </Reveal>
                </li>
              ))}
              {calloutInGrid ? (
                <li className="min-w-0">
                  {/* Stays in view while the taller neighbouring card scrolls past. */}
                  <Reveal className="h-full" delay={80}>
                    <GitHubCallout github={github} layout="tile" className="md:sticky md:top-28" />
                  </Reveal>
                </li>
              ) : null}
            </ul>
          </>
        ) : null}

        {calloutInGrid ? null : (
          <Reveal>
            <GitHubCallout github={github} layout="banner" className="mt-6" />
          </Reveal>
        )}
      </div>
    </section>
  );
}
