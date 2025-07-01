# Expect-WebDriverIO Framework

Expect-WebDriverIO is inspired by [`expect`](https://www.npmjs.com/package/expect) but also extending it. Therefore we can exploit usually everything provided by the API of expect with some WebDriverIO touch.
  - Note: Yes, this is a package of Jest but it is usable without Jest.

## Compatibility

We can pair `expect-webdriver` with Jest, mocha, Jasmine.
  - When an `expect` is defined globally, we usually overwrite it with the one of `expect-webdriverio` to have our defined assertions works out of the box.

### Jest
We can use `expect-webdriver` with Jest with either the `@jest/global` (preferred) or the `@types/jest` (have global imports support)
  - Note: Jest maintainer does not support `@types/jest`. In case this library gets out of date or has problems, support might be dropped.

In each case, when used outside of [WDIO Testrunner](https://webdriver.io/docs/clioptions), types are required to be added in your `tsconfig.ts`
  - Note: With Jest the matcher `toMatchSnapshot` and `toMatchInlineSnapshot` were overloaded. To resolved correctly the types `expect-webdriverio/jest` must be last.

#### @jest/global
When paired with Jest and the `@jest/global`, we should use imports specifically

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

Expected `tsconfig.ts`:
```json
    "types": [
      "@jest/globals",
      "expect-webdriverio/jest",
      ],
```  


#### @type/jest
When paired with Jest and the `@types/jest`, no imports are required. Global one are already defined correctly

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expect(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected `tsconfig.ts`:
```json
    "types": [
      "@types/jest",
      "expect-webdriverio/jest",
      ],
```
    
### Mocha
When paired with mocha, it can be used without (standalone) or with `chai` (or any other assertion Library)

### Standalone
No import is required, everything is set globally

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        const browser: WebdriverIO.Browser = {} as unknown as WebdriverIO.Browser
        await expect(browser).toHaveUrl('https://example.com')
    })
})     
```

Expected `tsconfig.ts`:
```json
    "types": [
      "@types/mocha",
      "expect-webdriverio",
    ]
```

### Chai
TODO

### Jasmine
When paired with Jasmine, it must also be used with `@wdio/jasmine-framework` from [webdriverio](https://github.com/webdriverio/webdriverio) since multiple configuration must be done prior to be runnable. For example, we actually force the `expect` being used to be the `expectAsync` instance so the promises resolved correctly.

Expected `tsconfig.ts`:
  - Note `expect-webdriverio/jasmine` must be before `@types/jasmine` to use the correct `expect` type of WebDriverIO globally
```json
    "types": [
      "expect-webdriverio/jasmine",
      "@types/jasmine",
    ]
```

