## TypeScript

If you are using the [WDIO Testrunner](https://webdriver.io/docs/clioptions) everything will be automatically setup. Just follow the [setup guide](https://webdriver.io/docs/typescript#framework-setup) from the docs. However if you run WebdriverIO with a different testrunner or in a simple Node.js script you will need to add `expect-webdriverio` to `types` in the `tsconfig.json`.

- `"expect-webdriverio"` for everyone except of Jasmine/Jest users.
- `"expect-webdriverio/jasmine"` Jasmine
- `"expect-webdriverio/jest"` Jest

## JavaScript (VSCode)

It's required to create `jsconfig.json` in project root and refer to the type definitions to make autocompletion work in vanilla js.

```json
{
  "include": [
    "**/*.js",
    "**/*.json",
    "node_modules/expect-webdriverio"
  ]
}
```
