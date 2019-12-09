## TypeScript

Add `expect-webdriverio` to `types` in the `tsconfig.json`
- `"expect-webdriverio"` for everyone except of Jasmine/Jest users.
- `"expect-webdriverio/jasmine"` Jasmine
- `"expect-webdriverio/jest"` Jest
- `"expect-webdriverio/types/standalone-global"` to use as an additional expectation lib (not recommended)

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
