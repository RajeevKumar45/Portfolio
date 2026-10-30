import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type HtmlTagDescriptor, type Plugin } from 'vite';
import { site } from './src/config/site.ts';

/**
 * Generates SEO and social-sharing tags from src/config/site.ts.
 * Set SITE_URL (for example https://rajeevkumar.dev) when deploying so that
 * canonical, og:url, and og:image use absolute URLs, which link previews require.
 */
function portfolioMeta(siteUrl: string, base: string): Plugin {
  const origin = siteUrl.trim().replace(/\/+$/, '');
  const pathBase = base.endsWith('/') ? base : `${base}/`;
  const absolute = (path: string) => (origin ? `${origin}${path}` : `${pathBase}${path.replace(/^\//, '')}`);

  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' });

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    description: site.headline,
    email: `mailto:${site.email}`,
    ...(origin ? { url: `${origin}/` } : {}),
    sameAs: [site.links.github, site.links.linkedin, site.links.leetcode],
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: site.education.institution,
      address: site.education.location,
    },
    knowsAbout: ['Software development', 'Artificial intelligence', 'Machine learning', 'Full-stack development'],
  };

  return {
    name: 'portfolio-meta',
    transformIndexHtml() {
      const image = absolute('/og-image.png');
      const tags: HtmlTagDescriptor[] = [
        { tag: 'title', children: site.seo.title, injectTo: 'head' },
        meta({ name: 'description', content: site.seo.description }),
        meta({ name: 'author', content: site.name }),
        meta({ name: 'theme-color', content: site.seo.themeColor }),
        meta({ property: 'og:type', content: 'website' }),
        meta({ property: 'og:site_name', content: site.name }),
        meta({ property: 'og:title', content: site.seo.title }),
        meta({ property: 'og:description', content: site.seo.description }),
        meta({ property: 'og:image', content: image }),
        meta({ property: 'og:image:width', content: '1200' }),
        meta({ property: 'og:image:height', content: '630' }),
        meta({ property: 'og:image:alt', content: site.seo.imageAlt }),
        meta({ property: 'og:locale', content: 'en_IN' }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        meta({ name: 'twitter:title', content: site.seo.title }),
        meta({ name: 'twitter:description', content: site.seo.description }),
        meta({ name: 'twitter:image', content: image }),
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(person).replace(/</g, '\\u003c'),
          injectTo: 'head',
        },
      ];
      if (origin) {
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` }, injectTo: 'head' },
          meta({ property: 'og:url', content: `${origin}/` }),
        );
      }
      return tags;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // BASE_PATH is only needed for sub-path hosting, e.g. GitHub Pages project sites ("/portfolio/").
  const base = env.BASE_PATH || '/';
  // An explicit SITE_URL wins; on Vercel, fall back to the project's production domain.
  const siteUrl =
    env.SITE_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '');

  return {
    base,
    plugins: [react(), tailwindcss(), portfolioMeta(siteUrl, base)],
    build: {
      target: 'es2022',
    },
  };
});
