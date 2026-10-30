# Rajeev Kumar — Portfolio

Personal portfolio of Rajeev Kumar, Computer Science Engineering student at BMS Institute of Technology & Management.

Built with React 19, TypeScript, Vite 8, and Tailwind CSS 4. It has no backend: everything is static except an optional, unauthenticated call to the public GitHub API.

## Run locally

Requires Node.js 22 or newer.

```powershell
npm install
npm run dev        # http://localhost:5173
```

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build at http://localhost:4173 |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | Oxlint (React, TypeScript, and accessibility rules) |
| `npm run qa` | Browser QA against a running preview (see below) |
| `npm run assets:brand` | Regenerate the social image and touch icon |

## Edit the content

All content lives in `src/config/`; components read from it.

| File | What it controls |
| --- | --- |
| `site.ts` | Name, headline, links, hero, About text, education, contact copy, and SEO tags |
| `projects.ts` | Project cards: description, highlights, technologies, links, status, images |
| `skills.ts` | Skill groups, where each was used, and areas of interest |
| `portrait.ts` | Portrait alt text and image files |

### Projects

Each entry in `projects.ts` is one card. To add a project, copy an entry and give it a unique `id`.

- `status`: `'Under Consideration'`, `'In Development'`, or `'Completed'`.
- `liveDemoUrl`: keep `null` until a deployment works. The Live Demo button only appears when it is set.
- `repositoryVerified`: set to `true` only when the repository is public. While `false`, the card shows "Repository not public yet" instead of a link that would 404. CodeLens is `false` because its URL returned HTTP 404 on 29 Oct 2026.
- `featured: true` gives the large layout at the top of the section.
- `teamProject` and `role` describe collaborative work.
- `image`: put a WebP screenshot (about 1200 px wide) in `src/assets/projects/`, import it at the top of the file, and set its `width`, `height`, and `alt`.

### Contact form and email links

Email links open a Gmail compose window addressed to you instead of using `mailto:`, which does nothing on computers without a desktop mail app.

By default, the contact form checks the visitor's name, email, and message, then opens a pre-filled Gmail draft that the visitor sends themselves. To have messages arrive in your inbox directly, without the visitor leaving the site:

1. Sign up at https://formspree.io with rajeevkumar642006@gmail.com and create a form.
2. Copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `formEndpoint` in `src/config/site.ts`, then redeploy.

The form shows "Message sent" only after Formspree confirms delivery. If a send fails, it shows an error and offers the Gmail draft instead.

### Portrait

To replace the photo, run:

```powershell
npm run assets:brand -- --portrait "C:/path/to/photo.png"
```

This rewrites the portrait crops in `src/assets/profile/` and refreshes `public/og-image.png`. The crop positions assume a centred head-and-shoulders photo; adjust `PORTRAIT_CROPS` in `scripts/brand-assets.mjs` for different framing.

## GitHub integration

The Projects section requests `https://api.github.com/users/rajeevkumar-05/repos` once per browser session (cached in `sessionStorage` for 30 minutes). It uses no token. The data adds the primary language and last-push date to each card and a public-repository count. Stars are shown only when there are some.

If the API is rate-limited, offline, or returns something unexpected, the cards fall back to `projects.ts` and nothing breaks. If GitHub confirms a repository marked `repositoryVerified: false` is now public, its link turns on automatically.

## Deploy

**Live site:** https://rajeev-kumar.vercel.app. This is the Vercel project `rajeev-kumar` in the `rajeevkumar642006-labs-projects` team on the Hobby plan.

To publish changes, run this from the project folder:

```powershell
npx vercel@latest deploy --prod --yes --scope rajeevkumar642006-labs-projects --project rajeev-kumar
```

Vercel builds the site remotely using `vercel.json`, which sets `npm run build`, the `dist` output folder, long-term caching for hashed files in `/assets`, and basic security headers. `.vercelignore` keeps local caches and the original photo out of the upload. On Vercel, link-preview URLs use the project's production domain automatically. To use a custom domain instead, set `SITE_URL` in the project's environment variables.

The project isn't connected to Git, so changes go live only when you run the command above. For automatic deploys, push this folder to a GitHub repository and connect it under Project Settings → Git.

**Other static hosts (such as Netlify)**: set the build command to `npm run build`, set the output directory to `dist`, and set `SITE_URL` to the final address so the canonical URL, `og:url`, and `og:image` are absolute.

**GitHub Pages**: for a project site such as `https://rajeevkumar-05.github.io/portfolio/`, build with `BASE_PATH=/portfolio/` and `SITE_URL=https://rajeevkumar-05.github.io/portfolio`, then publish `dist/`. A user site (`rajeevkumar-05.github.io`) needs only `SITE_URL`.

## Quality checks

```powershell
npm run build
npm run preview    # keep running
npm run qa         # in a second terminal
```

`scripts/qa.mjs` drives a local Chrome or Edge (set `CHROME_PATH` to override) and checks:

- layout at 375, 430, 768, 1366, and 1920 px;
- navigation, the mobile menu, and the skip link;
- links and metadata;
- axe-core accessibility rules and reduced motion;
- five GitHub API failure modes;
- a guard against fabricated metrics or credentials.

Screenshots are saved to `.cache/qa/`. LinkedIn and LeetCode block automated requests, so the script reports those two links as warnings rather than verifying them.
