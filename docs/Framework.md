# Expect-WebDriverIO Framework

Expect-WebDriverIO is inspired by [`expect`](https://www.npmjs.com/package/expect) but also extends it. Therefore, we can use everything provided by the expect API with some WebDriverIO enhancements.
  - Note: Yes, this is a package of Jest but it is usable without Jest.

## Compatibility

We can pair `expect-webdriverio` with [Jest](https://jestjs.io/), [Mocha](https://mochajs.org/), and even [Jasmine](https://jasmine.github.io/). 

It is highly recommended to use it with a [WDIO Testrunner](https://webdriver.io/docs/clioptions) which provides additional auto-configuration for a plug-and-play experience.

When used <u>**outside of [WDIO Testrunner](https://webdriver.io/docs/clioptions)**</u>, types need to be added to your [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

### Jest
We can use `expect-webdriverio` with [Jest](https://jestjs.io/) using [`@jest/globals`](https://www.npmjs.com/package/@jest/globals) alone (preferred) and optionally [`@types/jest`](https://www.npmjs.com/package/@types/jest) (which has global ambient support).
  - Note: Jest maintainers do not support [`@types/jest`](https://www.npmjs.com/package/@types/jest). If this library gets out of date or has problems, support might be dropped.
  - Note: With Jest, the matchers `toMatchSnapshot` and `toMatchInlineSnapshot` are overloaded. To resolve the types correctly, `expect-webdriverio/jest` must be last.

#### With `@jest/globals`
When paired only with [`@jest/globals`](https://www.npmjs.com/package/@jest/globals), we should `import` the `expect` function from `expect-webdriverio`.

```ts
import { expect } from 'expect-webdriverio'
import { describe, it, expect as jestExpect } from '@jest/globals'

describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expect(browser).toHaveUrl('https://example.com')
    })
})        
```

No `types` are expected in `tsconfig.json`.
Optionally, to avoid needing `import { expect } from 'expect-webdriverio'`, you can use the following:
```json
{
  "compilerOptions": {
    "types": ["expect-webdriverio/expect-global"]
  }
}
```   
##### Augmenting `@jest/globals` JestMatchers
Multiple attempts were made to augment `@jest/globals` to support `expect-webdriverio` matchers directly on JestMatchers. However, no namespace is available to augment it; therefore, only module augmentation can be used. This method does not allow adding matchers with the `extends` keyword; instead, they need to be added directly in the interface of the module declaration augmentation, which would create a lot of code duplication.

This [Jest issue](https://github.com/jestjs/jest/issues/12424) seems to target this problem, but it is still in progress.


#### With `@types/jest`
When also paired with [`@types/jest`](https://www.npmjs.com/package/@types/jest), no imports are required. Global ambient types are already defined correctly and you can simply use Jest's `expect` directly.

If you are NOT using WDIO Testrunner, it may be required to correctly register the WDIO matchers on Jest's `expect` as shown below:
```ts
import { expect } from "@jest/globals";
import { matchers } from "expect-webdriverio";

beforeAll(async () => { 
  expect.extend(matchers);  
});
```

As shown below, no imports are required and we can use WDIO matchers directly on Jest's `expect`:
```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expect(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
        "@types/jest",
        "expect-webdriverio/jest" // Must be last for overloaded matchers `toMatchSnapshot` and `toMatchInlineSnapshot` 
      ]
  }
}
```
    
### Mocha
When paired with [Mocha](https://mochajs.org/), it can be used without (standalone) or with [`chai`](https://www.chaijs.com/) (or any other assertion library).

#### Standalone
No import is required; everything is set globally.

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expect(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
        "@types/mocha",
        "expect-webdriverio/expect-global"
      ]
  }
}
```

#### Chai
`expect-webdriverio` can coexist with the [Chai](https://www.chaijs.com/) assertion library by importing both libraries explicitly.
See also this [documentation](https://webdriver.io/docs/assertion/#migrating-from-chai).

### Jasmine
When paired with [Jasmine](https://jasmine.github.io/), [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) is also required to configure it correctly, as it needs to force `expect` to be `expectAsync` and also register the WDIO matchers with `addAsyncMatcher` since `expect-webdriverio` only supports the Jest-style `expect.extend` version.

The types `expect-webdriverio/jasmine` are still offered but are subject to removal or being moved into `@wdio/jasmine-framework`. The usage of `expectAsync` is also subject to future removal.

#### Jasmine `expectAsync`
Since the above types augment the `AsyncMatcher` of Jasmine, with this library alone it looks like the following, even though it is not runnable since the matchers are not registered:

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expectAsync(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
        "@types/jasmine",
        "expect-webdriverio/jasmine"
      ]
  }
}
```

#### `expect` of `expect-webdriverio`
It is preferable to use the `expect` from `expect-webdriverio` to guarantee future compatibility. 

```ts
// Required if we do not force the 'expect-webdriverio' expect globally with `"expect-webdriverio/expect-global"`
import { expect as wdioExpect } from 'expect-webdriverio'

describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await wdioExpect(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
        "@types/jasmine",
        "expect-webdriverio/expect-global", // Force expect to be the 'expect-webdriverio'; comment out and use the import above if it conflicts with Jasmine
      ]
  }
}
```

#### Asymmetric matchers 
Asymmetric matchers have limited support. Even though `jasmine.stringContaining` has no error, it potentially does not work even with `@wdio/jasmine-framework`, but the example below should work:

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
    })
})     
```


