/**
 * Browser QA for the built portfolio.
 *
 *   npm run build && npm run preview      # in one terminal
 *   npm run qa                            # in another (defaults to http://localhost:4173/)
 *   npm run qa -- http://localhost:5173/  # or test the dev server
 *
 * Checks layout at five viewports, navigation, the mobile menu, links,
 * metadata, accessibility (axe-core), GitHub API failure handling, and
 * guards against fabricated claims. Screenshots go to .cache/qa/.
 * GitHub API calls are answered from one cached real response so repeated
 * runs do not use up the 60-requests-per-hour limit.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { launchBrowser } from './lib/browser.mjs';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, '.cache', 'qa');
mkdirSync(outDir, { recursive: true });

const BASE_URL = process.argv[2] ?? process.env.QA_URL ?? 'http://localhost:4173/';
const GITHUB_USER = 'rajeevkumar-05';
const EXPECTED = {
  title: 'Rajeev Kumar | Software Developer Portfolio',
  description:
    "Explore Rajeev Kumar's software projects, technical interests, GitHub repositories, and work in software development and AI.",
  links: [
    'https://github.com/rajeevkumar-05',
    'https://www.linkedin.com/in/rajeev-kumar-88a1252a3/',
    'https://leetcode.com/u/rmml71URiv/',
    'https://mail.google.com/mail/?view=cm&fs=1&to=rajeevkumar642006%40gmail.com',
    'https://github.com/rajeevkumar-05/ForegeWeb.git',
  ],
  forbiddenLinks: ['https://github.com/rajeevkumar-05/CodeLens.git'],
  email: 'rajeevkumar642006@gmail.com',
  sections: ['home', 'about', 'skills', 'projects', 'education', 'contact'],
};

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812, isMobile: true, hasTouch: true },
  { name: 'mobile-430', width: 430, height: 932, isMobile: true, hasTouch: true },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'laptop-1366', width: 1366, height: 768 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

// Claims the portfolio must never make without evidence.
const FORBIDDEN_TEXT = [
  /\bCGPA\b/i,
  /\bGPA\b/i,
  /\b8\.76\b/,
  /\bintern(ship)?s?\b/i,
  /\baward/i,
  /\bcertif/i,
  /years? of experience/i,
  /problems? solved/i,
  /\branking\b/i,
  /\bcontest rating\b/i,
  /\btestimonial/i,
  /\b\d+(\.\d+)?\s?%/,
  /\b\d{1,3}(,\d{3})+\+/,
];

const results = [];
const record = (status, name, details = '') => {
  results.push({ status, name, details });
  const tag = status === 'pass' ? 'PASS' : status === 'warn' ? 'WARN' : 'FAIL';
  console.log(`${tag}  ${name}${details ? `\n      ${details}` : ''}`);
};
const check = (name, ok, details = '') => record(ok ? 'pass' : 'fail', name, ok ? '' : details);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- GitHub fixture (one real response, cached for an hour) ----------

async function loadGitHubFixture() {
  const file = path.join(outDir, 'github-fixture.json');
  if (existsSync(file) && Date.now() - statSync(file).mtimeMs < 60 * 60 * 1000) {
    return { data: JSON.parse(readFileSync(file, 'utf8')), source: 'cached real response' };
  }
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed&type=owner`,
      { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-qa' } },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    writeFileSync(file, JSON.stringify(data));
    return { data, source: 'live response' };
  } catch (error) {
    return { data: null, source: `unavailable (${error.message})` };
  }
}

const fixture = await loadGitHubFixture();
record(fixture.data ? 'pass' : 'warn', `GitHub API fixture: ${fixture.source}`);

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-expose-headers': 'x-ratelimit-remaining',
};

function answerGitHub(request, mode) {
  if (request.method() === 'OPTIONS') {
    return request.respond({ status: 204, headers: { ...CORS, 'access-control-allow-headers': '*' } });
  }
  switch (mode) {
    case 'fixture':
      return fixture.data
        ? request.respond({ status: 200, contentType: 'application/json', headers: CORS, body: JSON.stringify(fixture.data) })
        : request.continue();
    case 'rate-limited':
      return request.respond({
        status: 403,
        contentType: 'application/json',
        headers: { ...CORS, 'x-ratelimit-remaining': '0' },
        body: '{"message":"API rate limit exceeded"}',
      });
    case 'server-error':
      return request.respond({ status: 502, contentType: 'text/plain', headers: CORS, body: 'Bad gateway' });
    case 'offline':
      return request.abort('internetdisconnected');
    case 'malformed':
      return request.respond({ status: 200, contentType: 'application/json', headers: CORS, body: '{"unexpected":' });
    case 'empty':
      return request.respond({ status: 200, contentType: 'application/json', headers: CORS, body: '[]' });
    default:
      return request.continue();
  }
}

// ---------- Page helpers ----------

const browser = await launchBrowser({ protocolTimeout: 60000 });

async function openPage(viewport, { github = 'fixture', reducedMotion = false } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ deviceScaleFactor: 1, ...viewport });
  if (reducedMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

  const logs = { console: [], pageErrors: [], failedRequests: [] };
  page.on('console', (message) => {
    if (['error', 'warn', 'warning'].includes(message.type())) {
      const location = message.location()?.url ?? '';
      logs.console.push({ type: message.type(), text: message.text(), url: location });
    }
  });
  page.on('pageerror', (error) => logs.pageErrors.push(error.message));
  // A stray click on an external link would open a tab and background this page.
  page.on('popup', (popup) => {
    logs.popups = (logs.popups ?? 0) + 1;
    popup?.close().catch(() => undefined);
  });
  page.on('requestfailed', (request) => {
    if (!request.url().startsWith('https://api.github.com/')) {
      logs.failedRequests.push(`${request.url()} (${request.failure()?.errorText})`);
    }
  });

  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url().startsWith('https://api.github.com/')) return answerGitHub(request, github);
    // Tests set page.formReply to answer contact-form submissions without sending real mail.
    if (request.url().startsWith('https://formspree.io/') && page.formReply) {
      return request.respond({ contentType: 'application/json', headers: CORS, ...page.formReply });
    }
    return request.continue();
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  return { context, page, logs };
}

/** Console problems, ignoring the browser's own log line for an intentionally failed API call. */
function consoleProblems(logs, { allowGitHubNetworkErrors = false } = {}) {
  return logs.console.filter(
    (entry) =>
      !(allowGitHubNetworkErrors && /Failed to load resource/i.test(entry.text) && (entry.url.includes('api.github.com') || entry.url === '')),
  );
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const step = Math.max(200, Math.floor(window.innerHeight * 0.5));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await frame();
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await frame();
    await new Promise((resolve) => setTimeout(resolve, 900));
    const settle = (promise) => Promise.race([promise.catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 4000))]);
    await Promise.all([...document.images].map((image) => settle(image.decode())));
    window.scrollTo(0, 0);
    await frame();
  });
}

/** A point below the open menu that is not a link or button, for "tap outside" tests. */
async function findInertPoint(page) {
  return page.evaluate(() => {
    for (let y = window.innerHeight - 40; y > 80; y -= 20) {
      for (const x of [8, 12, window.innerWidth - 8]) {
        const element = document.elementFromPoint(x, y);
        if (element && !element.closest('a, button, header, input, label')) return { x, y };
      }
    }
    return null;
  });
}

// ---------- 1. Responsive layout at each viewport ----------

for (const viewport of VIEWPORTS) {
  const { context, page, logs } = await openPage(viewport);
  await scrollThrough(page);

  const layout = await page.evaluate(() => {
    const width = window.innerWidth;
    const clippedByAncestor = (element) => {
      for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (['hidden', 'clip'].includes(style.overflowX) || ['hidden', 'clip'].includes(style.overflow)) {
          const rect = node.getBoundingClientRect();
          if (rect.right <= width + 1 && rect.left >= -1) return true;
        }
      }
      return false;
    };
    const offenders = [];
    for (const element of document.body.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if ((rect.right > width + 1 || rect.left < -1) && !clippedByAncestor(element)) {
        offenders.push(`${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} (${Math.round(rect.left)}→${Math.round(rect.right)})`);
      }
    }

    // Text cut off by a card or container (overflow: hidden hides it from the check above).
    const clippedText = [];
    for (const element of document.body.querySelectorAll('*')) {
      const ownText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!ownText) continue;
      const style = getComputedStyle(element);
      if (style.textOverflow === 'ellipsis' || element.closest('.sr-only, [aria-hidden="true"]')) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue;
      let clipper = element.parentElement;
      while (clipper && clipper !== document.body) {
        const clipStyle = getComputedStyle(clipper);
        if (['hidden', 'clip'].includes(clipStyle.overflowX)) break;
        clipper = clipper.parentElement;
      }
      const bounds = clipper && clipper !== document.body ? clipper.getBoundingClientRect() : { left: 0, right: width };
      if (rect.right > bounds.right + 1 || rect.left < bounds.left - 1) {
        clippedText.push(`"${element.textContent.trim().slice(0, 40)}" (${Math.round(rect.left)}→${Math.round(rect.right)}, container ${Math.round(bounds.left)}→${Math.round(bounds.right)})`);
      }
    }

    const smallTargets = [];
    const tightTargets = [];
    for (const element of document.querySelectorAll('a[href], button')) {
      const style = getComputedStyle(element);
      if (style.display === 'inline' || style.visibility === 'hidden') continue;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0 || element.closest('[hidden]')) continue;
      if (element.matches('a[href="#main"]')) continue; // skip link is only shown on focus
      const label = (element.textContent || element.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (rect.width < 24 || rect.height < 24) smallTargets.push(`${label} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
      else if (rect.height < 40) tightTargets.push(`${label} ${Math.round(rect.width)}x${Math.round(rect.height)}`);
    }

    return {
      scrollWidth: document.documentElement.scrollWidth,
      width,
      offenders: offenders.slice(0, 12),
      clippedText: clippedText.slice(0, 12),
      smallTargets,
      tightTargets,
      revealHidden: [...document.querySelectorAll('.reveal:not(.is-visible)')].length,
    };
  });

  check(
    `[${viewport.name}] no horizontal overflow`,
    layout.scrollWidth <= layout.width && layout.offenders.length === 0,
    `scrollWidth=${layout.scrollWidth} viewport=${layout.width}; ${layout.offenders.join('; ')}`,
  );
  check(`[${viewport.name}] no text clipped by its container`, layout.clippedText.length === 0, layout.clippedText.join('; '));
  check(`[${viewport.name}] tap targets are at least 24x24 px`, layout.smallTargets.length === 0, layout.smallTargets.join('; '));
  if (layout.tightTargets.length) {
    record('warn', `[${viewport.name}] targets under 40 px tall`, layout.tightTargets.join('; '));
  }
  check(`[${viewport.name}] every section revealed after scrolling`, layout.revealHidden === 0, `${layout.revealHidden} still hidden`);

  const problems = consoleProblems(logs);
  check(
    `[${viewport.name}] clean console (no errors or warnings)`,
    problems.length === 0 && logs.pageErrors.length === 0 && logs.failedRequests.length === 0,
    [...problems.map((entry) => `${entry.type}: ${entry.text}`), ...logs.pageErrors, ...logs.failedRequests].join(' | '),
  );

  await page.screenshot({ path: path.join(outDir, `${viewport.name}.png`), fullPage: true });
  await context.close();
}

// ---------- 2. Document metadata, structure, links, and content ----------

{
  const { context, page } = await openPage(VIEWPORTS[3], { reducedMotion: true });
  await scrollThrough(page);
  const info = await page.evaluate(() => {
    const meta = (selector) => document.querySelector(selector)?.getAttribute('content') ?? null;
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName[1]));
    let skipped = null;
    headings.reduce((previous, level) => {
      if (level > previous + 1 && !skipped) skipped = `h${previous} → h${level}`;
      return level;
    }, 1);
    let jsonLd = null;
    try {
      jsonLd = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? 'null');
    } catch {
      jsonLd = 'invalid';
    }
    const anchors = [...document.querySelectorAll('a')].map((anchor) => ({
      href: anchor.getAttribute('href'),
      target: anchor.getAttribute('target'),
      rel: anchor.getAttribute('rel') ?? '',
      text: anchor.textContent.trim().replace(/\s+/g, ' '),
    }));
    const cards = [...document.querySelectorAll('[data-project-id]')].map((card) => ({
      id: card.dataset.projectId,
      url: card.dataset.repoUrl,
      state: card.dataset.repoState,
      linked: [...card.querySelectorAll('a')].some((anchor) => anchor.getAttribute('href') === card.dataset.repoUrl),
      unavailableLabel: Boolean(card.querySelector('[data-repo-unavailable]')),
      liveMeta: /Updated \d/.test(card.textContent),
      demo: [...card.querySelectorAll('a')].filter((a) => a.textContent.includes('Live Demo')).map((a) => a.getAttribute('href')),
      status: card.querySelector('[class*="rounded-full"]')?.textContent.trim() ?? '',
    }));
    return {
      lang: document.documentElement.lang,
      title: document.title,
      description: meta('meta[name="description"]'),
      ogTitle: meta('meta[property="og:title"]'),
      ogDescription: meta('meta[property="og:description"]'),
      ogImage: meta('meta[property="og:image"]'),
      twitterCard: meta('meta[name="twitter:card"]'),
      favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') ?? null,
      jsonLd,
      h1Count: headings.filter((level) => level === 1).length,
      skipped,
      imagesMissingAlt: [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length,
      imagesLoaded: [...document.querySelectorAll('img')].every((img) => img.complete && img.naturalWidth > 0),
      ids: [...document.querySelectorAll('[id]')].map((element) => element.id),
      anchors,
      cards,
      text: document.body.innerText,
      calloutText: document.querySelector('#projects')?.innerText.match(/\d+\+? public repositor(?:y|ies)[^\n]*/)?.[0] ?? null,
    };
  });

  check('html lang is "en"', info.lang === 'en', `lang=${info.lang}`);
  check('page title', info.title === EXPECTED.title, info.title);
  check('meta description', info.description === EXPECTED.description, String(info.description));
  check(
    'Open Graph and Twitter tags',
    info.ogTitle === EXPECTED.title && info.ogDescription === EXPECTED.description && Boolean(info.ogImage) && info.twitterCard === 'summary_large_image',
    JSON.stringify({ ogTitle: info.ogTitle, ogImage: info.ogImage, twitterCard: info.twitterCard }),
  );
  check('favicon linked', Boolean(info.favicon), String(info.favicon));
  check('JSON-LD Person data parses', info.jsonLd && info.jsonLd !== 'invalid' && info.jsonLd['@type'] === 'Person', JSON.stringify(info.jsonLd));
  check('exactly one h1', info.h1Count === 1, `h1 count=${info.h1Count}`);
  check('heading levels never skip', !info.skipped, String(info.skipped));
  check('all images have alt text and load', info.imagesMissingAlt === 0 && info.imagesLoaded, `missing alt=${info.imagesMissingAlt}, loaded=${info.imagesLoaded}`);
  check('all six sections exist', EXPECTED.sections.every((id) => info.ids.includes(id)));

  const badHrefs = info.anchors.filter((anchor) => !anchor.href || anchor.href === '#' || anchor.href.startsWith('javascript:'));
  check('no empty or placeholder links', badHrefs.length === 0, JSON.stringify(badHrefs));
  const brokenHashes = info.anchors.filter((anchor) => anchor.href?.startsWith('#') && !info.ids.includes(anchor.href.slice(1)));
  check('every in-page link has a target', brokenHashes.length === 0, JSON.stringify(brokenHashes.map((anchor) => anchor.href)));
  const unsafeExternal = info.anchors.filter(
    (anchor) => /^https?:/.test(anchor.href) && (anchor.target !== '_blank' || !anchor.rel.includes('noopener')),
  );
  check('external links open in a new tab with rel="noopener"', unsafeExternal.length === 0, JSON.stringify(unsafeExternal));
  const hrefs = new Set(info.anchors.map((anchor) => anchor.href));
  const missing = EXPECTED.links.filter((link) => !hrefs.has(link));
  check('required profile, email, and ForegeWeb links present', missing.length === 0, `missing: ${missing.join(', ')}`);
  const forbidden = EXPECTED.forbiddenLinks.filter((link) => hrefs.has(link));
  check('unverified CodeLens repository is not linked', forbidden.length === 0, forbidden.join(', '));
  const mailtoLinks = info.anchors.filter((anchor) => anchor.href?.startsWith('mailto:'));
  check(
    'no mailto: links (they do nothing without a desktop mail app)',
    mailtoLinks.length === 0,
    JSON.stringify(mailtoLinks),
  );

  for (const card of info.cards) {
    check(
      `project "${card.id}" repository button matches its state (${card.state})`,
      card.state === 'available' ? card.linked && !card.unavailableLabel : !card.linked && card.unavailableLabel,
      JSON.stringify(card),
    );
  }
  const forgeweb = info.cards.find((card) => card.id === 'forgeweb');
  check('ForgeWeb shows live GitHub metadata', Boolean(forgeweb?.liveMeta), JSON.stringify(forgeweb));
  check(
    'ForgeWeb status is "In Development", not "Under Consideration"',
    /In Development/.test(forgeweb?.status ?? '') && !/Under Consideration/.test(forgeweb?.status ?? ''),
    String(forgeweb?.status),
  );
  check('GitHub callout shows live repository count', Boolean(info.calloutText), String(info.calloutText));
  const demos = info.cards.flatMap((card) => card.demo);
  check('only verified live demo links are shown', demos.every((href) => href === 'https://typeforge-ai-frontend.vercel.app'), demos.join(', '));

  const fabricated = FORBIDDEN_TEXT.filter((pattern) => pattern.test(info.text)).map((pattern) => {
    const match = info.text.match(pattern);
    return `${pattern} → "${match?.[0]}"`;
  });
  check('no fabricated metrics, credentials, or experience claims in page text', fabricated.length === 0, fabricated.join('; '));

  // External link reachability (outside the browser).
  const external = [...new Set(info.anchors.map((anchor) => anchor.href).filter((href) => /^https?:/.test(href)))];
  for (const url of external) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36' },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) record('pass', `link reachable: ${url} (HTTP ${response.status})`);
      else if ([403, 429, 999].includes(response.status) && /linkedin\.com|leetcode\.com/.test(url)) {
        record('warn', `link not verifiable by script (bot protection, HTTP ${response.status}): ${url}`);
      } else record('fail', `link reachable: ${url}`, `HTTP ${response.status}`);
    } catch (error) {
      record('fail', `link reachable: ${url}`, error.message);
    }
  }

  await context.close();
}

// ---------- 3. Desktop navigation and scroll-spy ----------

{
  const { context, page } = await openPage(VIEWPORTS[3], { reducedMotion: true });
  for (const id of EXPECTED.sections) {
    await page.click(`nav[aria-label="Primary"] ul a[href="#${id}"]`);
    await wait(350);
    const state = await page.evaluate((sectionId) => {
      const header = document.querySelector('header').getBoundingClientRect();
      const heading = document.querySelector(`#${sectionId} h1, #${sectionId} h2`).getBoundingClientRect();
      const current = document.querySelector('nav[aria-label="Primary"] ul a[aria-current="location"]')?.getAttribute('href');
      return { hash: location.hash, headerBottom: header.bottom, headingTop: heading.top, viewport: innerHeight, current, scrollY };
    }, id);
    check(
      `nav "${id}": scrolls to section, heading clear of the header, link marked current`,
      state.hash === `#${id}` && state.headingTop >= state.headerBottom && state.headingTop < state.viewport && state.current === `#${id}`,
      JSON.stringify(state),
    );
  }

  // Keyboard: the skip link is the first tab stop and moves focus to <main>.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.keyboard.press('Tab');
  await wait(150);
  const skip = await page.evaluate(() => {
    const element = document.activeElement;
    const rect = element.getBoundingClientRect();
    return { text: element.textContent.trim(), visible: rect.top >= 0 && rect.bottom <= innerHeight };
  });
  await page.keyboard.press('Enter');
  await wait(200);
  const afterSkip = await page.evaluate(() => document.activeElement?.id);
  check('skip link is first, visible on focus, and moves focus to main', skip.text === 'Skip to content' && skip.visible && afterSkip === 'main', JSON.stringify({ skip, afterSkip }));

  // Focus ring is drawn for keyboard users.
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check('visible focus indicator on keyboard focus', outline !== 'none', `outline-style=${outline}`);
  await page.screenshot({ path: path.join(outDir, 'focus-ring.png') });

  // Copy email button.
  await context.overridePermissions(new URL(BASE_URL).origin, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
  const copyButton = await page.waitForSelector('xpath/.//button[contains(., "Copy Email")]');
  await copyButton.click();
  await wait(250);
  const copied = await page.evaluate(async () => ({
    label: [...document.querySelectorAll('#contact button')].map((button) => button.textContent.trim()).join(' | '),
    clipboard: await navigator.clipboard.readText().catch((error) => `error: ${error.message}`),
    status: document.querySelector('[data-copy-status]')?.textContent ?? '',
  }));
  check(
    'copy email button copies the address and announces it',
    copied.clipboard === EXPECTED.email && copied.label.includes('Email copied') && copied.status.includes(EXPECTED.email),
    JSON.stringify(copied),
  );
  await context.close();
}

// ---------- 3b. Contact form ----------

{
  const { context, page } = await openPage(VIEWPORTS[3], { reducedMotion: true });
  // Record window.open calls instead of opening real tabs.
  await page.evaluate(() => {
    window.__opened = [];
    window.open = (url) => {
      window.__opened.push(String(url));
      return { opener: null };
    };
  });

  const form = await page.$('#contact form');
  const mode = await page.$eval('#contact form', (element) => element.dataset.formMode);
  const fields = await page.evaluate(() =>
    ['name', 'email', 'message'].map((name) => {
      const control = document.querySelector(`#contact form [name="${name}"]`);
      const label = control ? document.querySelector(`label[for="${control.id}"]`)?.textContent.trim() : null;
      return { name, present: Boolean(control), label };
    }),
  );
  check('contact form has labelled name, email, and message fields', Boolean(form) && fields.every((field) => field.present && field.label), JSON.stringify(fields));

  // Empty submission: inline errors, focus moves to the first invalid field, nothing is sent.
  await page.click('#contact form button[type="submit"]');
  await wait(150);
  const invalid = await page.evaluate(() => ({
    invalid: [...document.querySelectorAll('#contact form [aria-invalid="true"]')].map((element) => element.getAttribute('name')),
    errors: [...document.querySelectorAll('#contact form [id$="-error"]')].map((element) => element.textContent.trim()),
    focused: document.activeElement?.getAttribute('name'),
    opened: window.__opened.length,
  }));
  check(
    'contact form: empty submit shows three errors, focuses Name, sends nothing',
    invalid.invalid.length === 3 && invalid.errors.length === 3 && invalid.focused === 'name' && invalid.opened === 0,
    JSON.stringify(invalid),
  );

  await page.type('#contact form [name="name"]', 'QA Tester');
  await page.type('#contact form [name="email"]', 'qa.tester@example.com');
  await page.type('#contact form [name="message"]', 'Hello Rajeev, this is an automated QA message.');

  if (mode === 'draft') {
    await page.click('#contact form button[type="submit"]');
    await wait(200);
    const draft = await page.evaluate(() => ({
      opened: window.__opened,
      state: document.querySelector('#contact form')?.dataset.formState,
      status: document.querySelector('[data-form-status]')?.textContent.trim() ?? '',
    }));
    const url = draft.opened[0] ? new URL(draft.opened[0]) : null;
    const params = url?.searchParams;
    check(
      'contact form (Gmail mode): opens a Gmail draft to Rajeev with subject and message, and says so',
      draft.opened.length === 1 &&
        url?.origin === 'https://mail.google.com' &&
        params?.get('to') === EXPECTED.email &&
        /QA Tester/.test(params?.get('su') ?? '') &&
        /automated QA message/.test(params?.get('body') ?? '') &&
        /qa\.tester@example\.com/.test(params?.get('body') ?? '') &&
        draft.state === 'draft-opened' &&
        /Press Send/.test(draft.status),
      JSON.stringify(draft),
    );
  } else {
    // Formspree mode: answer the request locally, first with a failure, then with success.
    page.formReply = { status: 500, body: '{"ok":false}' };
    await page.click('#contact form button[type="submit"]');
    await wait(500);
    const failed = await page.evaluate(() => document.querySelector('#contact form')?.dataset.formState);
    check('contact form (Formspree mode): a failed send shows an error, never "sent"', failed === 'error', String(failed));
    page.formReply = { status: 200, body: '{"ok":true}' };
    await page.click('#contact form button[type="submit"]');
    await wait(500);
    const sent = await page.evaluate(() => document.querySelector('[data-form-state="sent"]')?.textContent ?? null);
    check('contact form (Formspree mode): confirmed send shows "Message sent"', /Message sent/.test(sent ?? ''), String(sent));
  }
  await (await page.$('#contact')).screenshot({ path: path.join(outDir, 'contact-form.png') });
  await context.close();
}

// ---------- 4. Mobile menu ----------

{
  const { context, page } = await openPage(VIEWPORTS[0], { reducedMotion: true });
  const toggle = 'header button[aria-controls]';
  const menuState = () =>
    page.evaluate((selector) => {
      const button = document.querySelector(selector);
      const menu = document.getElementById(button.getAttribute('aria-controls'));
      return {
        expanded: button.getAttribute('aria-expanded'),
        visible: Boolean(menu && !menu.hidden && menu.getBoundingClientRect().height > 0),
        links: menu ? menu.querySelectorAll('ul a').length : 0,
        focusIsToggle: document.activeElement === button,
      };
    }, toggle);

  const initial = await menuState();
  check('mobile: menu starts closed', initial.expanded === 'false' && !initial.visible, JSON.stringify(initial));

  await page.click(toggle);
  await wait(150);
  const opened = await menuState();
  check('mobile: toggle opens the menu with all six links', opened.expanded === 'true' && opened.visible && opened.links === 6, JSON.stringify(opened));
  await page.screenshot({ path: path.join(outDir, 'mobile-menu-open.png') });

  await page.keyboard.press('Escape');
  await wait(150);
  const escaped = await menuState();
  check('mobile: Escape closes the menu and returns focus to the toggle', escaped.expanded === 'false' && !escaped.visible && escaped.focusIsToggle, JSON.stringify(escaped));

  await page.click(toggle);
  await wait(150);
  const point = await findInertPoint(page);
  if (point) await page.mouse.click(point.x, point.y);
  await wait(150);
  const outside = await menuState();
  check('mobile: tapping outside closes the menu', Boolean(point) && outside.expanded === 'false' && !outside.visible, JSON.stringify({ point, outside }));

  await page.click(toggle);
  await wait(150);
  const menuId = await page.$eval(toggle, (button) => button.getAttribute('aria-controls'));
  await page.click(`[id="${menuId}"] a[href="#projects"]`);
  await wait(400);
  const navigated = await page.evaluate(() => {
    const header = document.querySelector('header').getBoundingClientRect();
    const heading = document.querySelector('#projects h2').getBoundingClientRect();
    return { hash: location.hash, headingTop: heading.top, headerBottom: header.bottom };
  });
  const closed = await menuState();
  check(
    'mobile: menu link navigates, closes the menu, and clears the header',
    navigated.hash === '#projects' && navigated.headingTop >= navigated.headerBottom && closed.expanded === 'false',
    JSON.stringify({ navigated, closed }),
  );
  await context.close();
}

// ---------- 5. Portrait: shown and loaded at every screen size, sized for the screen ----------

for (const viewport of [VIEWPORTS[0], VIEWPORTS[2], VIEWPORTS[3]]) {
  const { context, page } = await openPage(viewport, { reducedMotion: true });
  const shown = await page.evaluate(() => {
    const image = document.querySelector('[data-hero-portrait]');
    const rect = image?.getBoundingClientRect();
    return {
      visible: Boolean(rect && rect.width > 0 && rect.height > 0),
      loaded: Boolean(image?.complete && image.naturalWidth > 1),
      source: image?.currentSrc.split('/').pop() ?? null,
      width: rect ? Math.round(rect.width) : 0,
      alt: image?.getAttribute('alt') ?? '',
    };
  });
  check(
    `[${viewport.name}] portrait shown and loaded, with alt text`,
    shown.visible && shown.loaded && /Rajeev Kumar/.test(shown.alt),
    JSON.stringify(shown),
  );
  await context.close();
}

// ---------- 6. Reduced motion ----------

{
  const { context, page } = await openPage(VIEWPORTS[3], { reducedMotion: true });
  const motion = await page.evaluate(() => ({
    hidden: document.querySelectorAll('.reveal:not(.is-visible)').length,
    animated: [...document.querySelectorAll('.enter, .flow-node')].filter(
      (element) => getComputedStyle(element).animationName !== 'none',
    ).length,
    smooth: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  check('reduced motion: content visible without scrolling, animations off, instant scrolling', motion.hidden === 0 && motion.animated === 0 && motion.smooth === 'auto', JSON.stringify(motion));
  await context.close();
}

// ---------- 7. Accessibility (axe-core) ----------

const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
for (const viewport of [VIEWPORTS[0], VIEWPORTS[3]]) {
  const { context, page } = await openPage(viewport, { reducedMotion: true });
  await page.evaluate(axeSource);
  const axe = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      wcag: violation.tags.some((tag) => /^wcag\d/.test(tag)),
      nodes: violation.nodes.slice(0, 4).map((node) => node.target.join(' ')),
    }));
  });
  const wcag = axe.filter((violation) => violation.wcag);
  const practice = axe.filter((violation) => !violation.wcag);
  check(`[${viewport.name}] axe-core: no WCAG 2.2 A/AA violations`, wcag.length === 0, JSON.stringify(wcag));
  if (practice.length) record('warn', `[${viewport.name}] axe-core best-practice notes`, JSON.stringify(practice));
  else record('pass', `[${viewport.name}] axe-core: no best-practice issues`);
  await context.close();
}

// ---------- 8. GitHub API failures never break the page ----------

for (const mode of ['rate-limited', 'server-error', 'offline', 'malformed', 'empty']) {
  const { context, page, logs } = await openPage(VIEWPORTS[3], { github: mode, reducedMotion: true });
  await wait(300);
  const state = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-project-id]')];
    const forgeweb = cards.find((card) => card.dataset.projectId === 'forgeweb');
    const codelens = cards.find((card) => card.dataset.projectId === 'codelens');
    return {
      cards: cards.length,
      forgewebLinked: Boolean(forgeweb?.querySelector('a[href="https://github.com/rajeevkumar-05/ForegeWeb.git"]')),
      codelensUnavailable: Boolean(codelens?.querySelector('[data-repo-unavailable]')),
      skeletons: document.querySelectorAll('#projects .animate-pulse').length,
      // The profile link stays, and no live numbers are shown without live data.
      callout:
        Boolean(document.querySelector('#projects a[href="https://github.com/rajeevkumar-05"]')) &&
        !document.querySelector('[data-github-summary]'),
    };
  });
  const problems = consoleProblems(logs, { allowGitHubNetworkErrors: true });
  check(
    `GitHub API "${mode}": cards fall back to config, no loading state left, no JS errors`,
    state.cards === 5 && state.forgewebLinked && state.codelensUnavailable && state.skeletons === 0 && state.callout && logs.pageErrors.length === 0 && problems.length === 0,
    JSON.stringify({ state, problems, pageErrors: logs.pageErrors }),
  );
  await context.close();
}

await browser.close();

// ---------- Summary ----------

const failed = results.filter((result) => result.status === 'fail');
const warned = results.filter((result) => result.status === 'warn');
console.log(`\n${results.length - failed.length - warned.length} passed, ${warned.length} warnings, ${failed.length} failed`);
console.log(`Screenshots: ${path.relative(root, outDir)}`);
process.exitCode = failed.length ? 1 : 0;
