# Expect-WebDriverIO Framework

Expect-WebDriverIO is inspired by [`expect`](https://www.npmjs.com/package/expect) but also extending it. Therefore we can exploit usually everything provided by the API of expect with some WebDriverIO touch.
  - Note: Yes, this is a package of Jest but it is usable without Jest.

## Compatibility

We can pair `expect-webdriverio` with [Jest](https://jestjs.io/), [Mocha](https://mochajs.org/), [Jasmine](https://jasmine.github.io/).
  - When an `expect` is defined globally, we usually overwrite it with the one of `expect-webdriverio` to have our defined assertions work out of the box.

### Jest
We can use `expect-webdriverio` with [Jest](https://jestjs.io/) with either the [`@jest/globals`](https://www.npmjs.com/package/@jest/globals) (preferred) or the [`@types/jest`](https://www.npmjs.com/package/@types/jest) (has global imports support)
  - Note: Jest maintainers do not support `@types/jest`. In case this library gets out of date or has problems, support might be dropped.

In each case, when used <u>**outside of [WDIO Testrunner](https://webdriver.io/docs/clioptions)**</u>, types are required to be added in your `tsconfig.json`
  - Note: With Jest the matchers `toMatchSnapshot` and `toMatchInlineSnapshot` were overloaded. To resolve correctly the types `expect-webdriverio/jest` must be last.

#### With `@jest/globals`
When paired with [Jest](https://jestjs.io/) and the [`@jest/globals`](https://www.npmjs.com/package/@jest/globals), we should `import` the `expect` keyword from `expect-webdriverio`

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

No `types` is expected in `tsconfig.json`
Optionally, to not need `import { expect } from 'expect-webdriverio'` you can use the below
```json
{
  "compilerOptions": {
    "types": ["expect-webdriverio/types"]
  }
}
```    

#### With `@types/jest`
When paired with [Jest](https://jestjs.io/) and the [`@types/jest`](https://www.npmjs.com/package/@types/jest), no imports are required. Global ones are already defined correctly

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
        "expect-webdriverio/jest" // Must be after for overloaded matchers `toMatchSnapshot` and `toMatchInlineSnapshot` 
      ]
  }
}
```
    
### Mocha
When paired with [Mocha](https://mochajs.org/), it can be used without (standalone) or with [`chai`](https://www.chaijs.com/) (or any other assertion library)

#### Standalone
No import is required, everything is set globally

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
        "expect-webdriverio/types"
      ]
  }
}
```

#### Chai
TODO - Integration with [Chai](https://www.chaijs.com/) assertion library

### Jasmine
When paired with [Jasmine](https://jasmine.github.io/), it must also be used with [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) from [webdriverio](https://github.com/webdriverio/webdriverio) since multiple configurations must be done prior to being runnable. For example, we actually force the `expect` being used to be the `expectAsync` instance so the promises resolve correctly.

Expected in `tsconfig.json`:
  - Note: `expect-webdriverio/jasmine` must be before `@types/jasmine` to use the correct `expect` type of WebDriverIO globally
```json
{
  "compilerOptions": {
    "types": [
      "expect-webdriverio/jasmine", // Must be before for the global to apply correctly
      "@types/jasmine"
    ]
  }
}
```

