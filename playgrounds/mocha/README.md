# Mocha Playground

This playground project uses the local build of `expect-webdriverio` with WebDriverIO and the Mocha framework. It serves as the default, out-of-the-box experience where all features are fully supported and work easily.

## Features and Support

Because Mocha is the standard framework for `expect-webdriverio`, all features work natively without conflicts:

*   **Soft Assertions**: Fully supported using the `SoftAssertionService` plugin in the `wdio.conf.ts` services.
*   **Snapshots**: Basic text/data snapshot testing works seamlessly.
*   **Visual Snapshots**: Visual snapshot testing directly integrates via `@wdio/visual-service`.
*   **Global Options Configuration**: Easily set global wait times and other configurations (e.g., `setOptions({ wait: 250 })` in the `before` hook).

## Setup

1. Build the parent project:
   ```bash
   cd ../.. && npm run build && cd playgrounds/mocha
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Structure

- `test/specs/` - E2E test files covering various feature sets (basic matchers, soft expectations, snapshots, visual comparisons).
- `wdio.conf.ts` - WebDriverIO configuration demonstrating how to wire up the `SoftAssertionService`, the Visual service, and global `expect-webdriverio` options.
- `visual-snapshot/` - Directory for storing and comparing visual screenshot baselines and temp images.
- Uses local build from `/expect-webdriverio/lib/index.js`.

## Tests

The example tests cover:
- Page basics (title, URL)
- Element visibility and existence
- Text content matching
- Multiple elements handling
- Element attributes
- Element interactions

## Notes

- Uses Mocha as the test framework
- Runs Chrome in headless mode
- Tests against webdriver.io website
- Imports expect-webdriverio from the local build directory
