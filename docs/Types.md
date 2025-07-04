# Types Definition
## TypeScript

If you are using the [WDIO Testrunner](https://webdriver.io/docs/clioptions) everything will be automatically setup. Just follow the [setup guide](https://webdriver.io/docs/typescript#framework-setup) from the docs. However if you run WebdriverIO with a different testrunner or in a simple Node.js script you will need to add `expect-webdriverio` to `types` in the `tsconfig.json`.

- `"expect-webdriverio"` for everyone except Jasmine/Jest users.
- `"expect-webdriverio/jasmine"` for [Jasmine](https://jasmine.github.io/)
- `"expect-webdriverio/jest"` for [Jest](https://jestjs.io/)
- `"expect-webdriverio/expect-global"` // Optional, if you wish to use expect of `expect-webdriverio` globally without explicit import
  - Note: Same as the former `"expect-webdriverio/types"`, now deprecated!

## JavaScript (VSCode)

It's required to create [`jsconfig.json`](https://code.visualstudio.com/docs/languages/jsconfig) in project root and refer to the type definitions to make autocompletion work in vanilla js.

```json
{
  "include": [
    "**/*.js",
    "**/*.json",
    "node_modules/expect-webdriverio"
  ]
}
```

## Jasmine special case
[Jasmine](https://jasmine.github.io/) is different from [Jest](https://jestjs.io/) or the standard `expect` definition since it supports promises using `expectAsync` which makes it quite challenging.

Even though this library by itself is not fully Jasmine-ready, it offers the types of the matcher only on the `AsyncMatcher` since using `jasmine.expect` does not work out-of-the-box. However, if you are pulling on the `expect` of `expect-webdriverio`, you will be able to have the WebDriverIO matcher types on `expect`. 

Support of `expectAsync` keyword is subject to change and may be dropped in the future!

### Dependency on `@wdio/jasmine-framework`
As mentioned above, this library alone is not working with Jasmine. It is required to manually do some tweaks, or it is strongly recommended to also pair it with `@wdio/jasmine-framework`. See [Framework.md](Framework.md) for more information.

When using [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework), since it replaces `jasmine.expect` with `jasmine.expectAsync`, then matchers are usable on the keyword `expect`, but still typing on `expect` directly from [Jasmine](https://jasmine.github.io/) namespace is not supported as of today!