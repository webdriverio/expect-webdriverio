# expect-webdriverio Playground - Mocha

This playground project uses the local build of expect-webdriverio with WebDriverIO and Mocha framework.

## Structure

- `test/specs/` - E2E test files
- `wdio.conf.ts` - WebDriverIO configuration with Mocha
- Uses local build from `../../lib/index.js`

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
