import { existsSync } from 'node:fs';
import puppeteer from 'puppeteer-core';

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

/** Finds a locally installed Chrome or Edge. Set CHROME_PATH to override. */
export function findBrowser() {
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    throw new Error('No Chrome or Edge installation found. Set CHROME_PATH to a Chromium-based browser executable.');
  }
  return found;
}

export function launchBrowser(options = {}) {
  return puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check', '--hide-scrollbars'],
    ...options,
  });
}
