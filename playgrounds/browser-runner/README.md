# Browser Runner Playground

This playground project uses the local build of `expect-webdriverio` with the Browser Runner to test integration with vue.

## Framework

Browser runner is a special case not relying on the `expect-webdriverio` configuration per see. It actual rely mainly on `expect` and only register wdio custom matchers using `expect` lib `expect.extend()` and NOT the one from `expect-webdriverio`!
