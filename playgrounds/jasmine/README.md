# Jasmine Playground

This is a playground for E2E testing with the `@wdio/jasmine-framework` to ensure compatibility with `expect-webdriverio`.

## Features and Limitations

*   **Soft Assertions**: `SoftAssertionService` is not supported, as Jasmine provides similar behavior natively.
*   **Snapshots**: Basic snapshot testing currently does not work well.
*   **Visual Snapshots**: The `@wdio/visual-service` does not work properly due to a lack of compatible hooks in Jasmine.
*   **Options Configuration**: Global configurations (like `setOptions({ wait: 500 })`) are fully supported.
*   **Asymmetric Matchers**: Native Jasmine asymmetric matchers (like `jasmine.any()`) are properly supported.

## Test Structure

*   `test/specs/expect-wdioImport/`: Tests using the direct import of `expect-webdriverio` (Jest-based).
*   `test/specs/globalImport/`: Tests using the global import, which pulls the Jasmine `expect` by default.
