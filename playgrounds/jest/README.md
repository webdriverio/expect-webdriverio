# Jest Playground

This is a playground for E2E testing with Jest, ensuring the compatibility of `expect-webdriverio` and primarily serving to test Jest augmentation.

## Notes and Limitations

*   **Framework**: There is no official WebdriverIO framework for Jest (e.g., no `@wdio/jest-framework`).
*   **Matcher Registration**: WebdriverIO custom matchers need to be manually registered via Jest augmentation to work with Jest's global `expect`.
*   **Snapshots**: Basic snapshot testing can work fine, but it may conflict with Jest's native snapshot mechanism.
*   **Visual Snapshots**: Visual snapshot testing works successfully.

## Test Structure

*   `test/`: Tests demonstrating integration with Jest using global matcher augmentation.
*   **TODO**: Add a `test/expect-wdioImport` folder showing how to use `expect-webdriverio` by importing it directly as a standalone module without global Jest augmentation.
