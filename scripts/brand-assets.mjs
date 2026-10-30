/**
 * Generates brand images with a local Chrome:
 *   - public/og-image.png         social-sharing image (1200x630)
 *   - public/apple-touch-icon.png Apple touch icon (180x180)
 *   - src/assets/profile/*.webp   portrait crops, only when --portrait is given
 *
 * Usage:
 *   npm run assets:brand
 *   npm run assets:brand -- --portrait "C:/path/to/photo.png"
 *
 * The portrait crop assumes a centred head-and-shoulders photo like the
 * current one. Adjust PORTRAIT_CROPS for a differently framed photo.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { site } from '../src/config/site.ts';
import { launchBrowser } from './lib/browser.mjs';

const root = path.resolve(import.meta.dirname, '..');
const profileDir = path.join(root, 'src', 'assets', 'profile');

/** Crops as fractions of the source image's width and height (4:5 portrait card at two widths). */
const PORTRAIT_CROPS = [
  { file: 'rajeev-kumar-960.webp', crop: { x: 0.1, y: 0, w: 0.8, h: 1 }, width: 960, height: 1200 },
  { file: 'rajeev-kumar-480.webp', crop: { x: 0.1, y: 0, w: 0.8, h: 1 }, width: 480, height: 600 },
];

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const dataUrl = (file, type) => `data:${type ?? MIME[path.extname(file).toLowerCase()]};base64,${readFileSync(file).toString('base64')}`;

// Fonts are inlined as data URLs so they load in a blank page without file access.
const font = (pkg, file) => dataUrl(path.join(root, 'node_modules', pkg, 'files', file), 'font/woff2');
const fonts = `
  @font-face { font-family: 'Geist'; font-weight: 100 900; src: url('${font('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'Instrument Serif'; font-style: normal; font-weight: 400; src: url('${font('@fontsource/instrument-serif', 'instrument-serif-latin-400-normal.woff2')}') format('woff2'); }
  @font-face { font-family: 'Instrument Serif'; font-style: italic; font-weight: 400; src: url('${font('@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff2')}') format('woff2'); }
`;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const portraitArg = process.argv.indexOf('--portrait');
const portraitSource = portraitArg > -1 ? path.resolve(process.argv[portraitArg + 1] ?? '') : null;
if (portraitSource && !existsSync(portraitSource)) {
  throw new Error(`Portrait source not found: ${portraitSource}`);
}

const favicon = readFileSync(path.join(root, 'public', 'favicon.svg'), 'utf8');

const browser = await launchBrowser();
try {
  const newPage = async (viewport) => {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    return page;
  };

  // ---------- Portrait crops ----------
  if (portraitSource) {
    mkdirSync(profileDir, { recursive: true });
    const source = dataUrl(portraitSource);
    for (const output of PORTRAIT_CROPS) {
      const page = await newPage({ width: output.width, height: output.height });
      await page.setContent(
        `<!doctype html><html><body style="margin:0;overflow:hidden;background:#fff"><img id="photo" src="${source}" style="position:absolute"></body></html>`,
        { waitUntil: 'load' },
      );
      await page.evaluate(({ crop, width, height }) => {
        const image = document.getElementById('photo');
        const scaleX = width / (crop.w * image.naturalWidth);
        const scaleY = height / (crop.h * image.naturalHeight);
        image.style.width = `${image.naturalWidth * scaleX}px`;
        image.style.height = `${image.naturalHeight * scaleY}px`;
        image.style.left = `${-crop.x * image.naturalWidth * scaleX}px`;
        image.style.top = `${-crop.y * image.naturalHeight * scaleY}px`;
        return image.decode();
      }, output);
      const file = path.join(profileDir, output.file);
      await page.screenshot({ path: file, type: 'webp', quality: 86 });
      await page.close();
      console.log(`Rendered ${path.relative(root, file)}`);
    }
  }

  // ---------- Social-sharing image ----------
  const portraitFile = path.join(profileDir, 'rajeev-kumar-480.webp');
  const portraitHtml = existsSync(portraitFile)
    ? `<figure class="portrait"><img src="${dataUrl(portraitFile)}" alt=""><figcaption><span class="cap-name">${escapeHtml(site.name)}</span><span class="cap-meta">B.E. Computer Science · BMSIT&amp;M</span></figcaption></figure>`
    : '';

  const ogHtml = `<!doctype html><html><head><style>
    ${fonts}
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; background: #fbfaf8; color: #1c1917; font-family: 'Geist', sans-serif; }
    .frame { position: relative; width: 100%; height: 100%; padding: 60px 72px; }
    .content { position: relative; display: flex; flex-direction: column; height: 100%; max-width: ${portraitHtml ? '700px' : '100%'}; }
    .brand { font-family: 'Instrument Serif', serif; font-size: 34px; letter-spacing: -0.01em; }
    .label { margin-top: auto; align-self: flex-start; display: inline-flex; align-items: center; gap: 10px; padding: 8px 16px; border: 1px solid rgb(28 25 23 / 0.16); border-radius: 999px; background: #fff;
      font-size: 14px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #57534e; }
    .label::before { content: ''; width: 7px; height: 7px; border-radius: 999px; background: #1e40af; }
    h1 { margin-top: 26px; font-family: 'Instrument Serif', serif; font-weight: 400; font-size: 92px; line-height: 0.96; letter-spacing: -0.015em; }
    h1 em { color: #1e40af; }
    .footer { margin-top: 30px; font-size: 21px; line-height: 1.45; color: #57534e; }
    .portrait { position: absolute; top: 60px; right: 72px; width: 344px; padding: 12px; border-radius: 26px; background: #fff;
      border: 1px solid rgb(28 25 23 / 0.09); box-shadow: 0 30px 70px -36px rgb(28 25 23 / 0.45); }
    .portrait img { display: block; width: 100%; height: 400px; object-fit: cover; object-position: 50% 18%; border-radius: 18px; }
    .portrait figcaption { display: flex; flex-direction: column; gap: 4px; padding: 14px 10px 4px; }
    .cap-name { font-family: 'Instrument Serif', serif; font-style: italic; font-size: 26px; line-height: 1.1; }
    .cap-meta { font-size: 12px; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; color: #6f6862; }
  </style></head><body><div class="frame">${portraitHtml}<div class="content">
    <p class="brand">${escapeHtml(site.name)}</p>
    <p class="label">${escapeHtml(site.hero.label)}</p>
    <h1>${escapeHtml(site.hero.headlineLead)} <em>${escapeHtml(site.hero.headlineAccent)}</em> ${escapeHtml(site.hero.headlineTail)}</h1>
    <p class="footer">${escapeHtml(site.headline)}</p>
  </div></div></body></html>`;

  const iconHtml = `<!doctype html><html><head><style>
    * { margin: 0; }
    body { width: 180px; height: 180px; overflow: hidden; background: #1c1917; display: grid; place-items: center; }
    svg { width: 180px; height: 180px; }
  </style></head><body>${favicon.replace('rx="16"', 'rx="0"').replace('x="2" y="2" width="60" height="60"', 'x="0" y="0" width="64" height="64"')}</body></html>`;

  const render = async (html, viewport, file) => {
    const page = await newPage(viewport);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const output = path.join(root, 'public', file);
    await page.screenshot({ path: output, type: 'png' });
    await page.close();
    console.log(`Rendered ${path.relative(root, output)}`);
  };

  await render(ogHtml, { width: 1200, height: 630 }, 'og-image.png');
  await render(iconHtml, { width: 180, height: 180 }, 'apple-touch-icon.png');
} finally {
  await browser.close();
}
