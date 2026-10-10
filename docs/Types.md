## Types Definition
### TypeScript

If you are using the [WDIO Testrunner](https://webdriver.io/docs/clioptions) everything will be automatically setup. Just follow the [setup guide](https://webdriver.io/docs/typescript#framework-setup) from the docs. However if you run WebdriverIO with a different testrunner or in a simple Node.js script you will need to add `expect-webdriverio` to `types` in the `tsconfig.json`.

- `"expect-webdriverio"` for everyone except Jasmine/Jest users.
- `"expect-webdriverio/jasmine"` for [Jasmine](https://jasmine.github.io/) without `@wdio/jasmine-framework`
- `"expect-webdriverio/jest"` for [Jest](https://jestjs.io/)
- `"expect-webdriverio/expect-global"` // Optional, if you wish to use expect of `expect-webdriverio` globally without explicit import

### JavaScript (VSCode)

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

### Jasmine
- With [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework): add `"@wdio/jasmine-framework"` to `types`, after `"@wdio/globals/types"`. It types its hybrid global `expect`: the Jasmine matchers stay synchronous, and the WebdriverIO matchers return a promise. Do not add `"expect-webdriverio/jasmine"`.
- With Jasmine alone: add `"expect-webdriverio/jasmine"`. It types the WebdriverIO matchers on `expectAsync`, which you register yourself.

See [Framework.md](Framework.md#jasmine) for the details.

### Custom matchers

See [TypeScript](CustomMatchers.md#typescript) in Custom Matchers to type your own matchers.
