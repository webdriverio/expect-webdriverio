import path from 'node:path';
import url from 'node:url';
import { $, expect } from '@wdio/globals';

// Resolve __dirname in ES Modules (Node 20.11+ / 21.2+)
const __dirname = import.meta.dirname;

describe.only('Shadow DOM Clickability Regression (#2191)', () => {
  it('should reproduce toBeClickable failing on elements inside Shadow DOM', async () => {
    // 1. Resolve local path to a file:// URL
    const resource = path.resolve(__dirname, '..', '__fixtures__', 'shadow-component.html');
    const fileUrl = url.pathToFileURL(resource).href;

    // 2. Open the fixture file directly in the browser
    await browser.url(fileUrl);

    // 3. Query target element inside Shadow DOM
    const btn = await $('>>>[data-url="/import"]');

    // 4. Assert visibility vs clickability
    await expect(btn).toBeDisplayed(); // Passes
    await expect(btn).toBeClickable();  // Fails on expect-webdriverio 6.0+
  });
});
