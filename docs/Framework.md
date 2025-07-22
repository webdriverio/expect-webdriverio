# Expect-WebDriverIO Framework

Expect-WebDriverIO is inspired by [`expect`](https://www.npmjs.com/package/expect) but also extends it. Therefore, we can use everything provided by the expect API with some WebDriverIO enhancements. Yes, this is a package of Jest but it is usable without Jest.

## Compatibility

We can pair `expect-webdriverio` with [Jest](https://jestjs.io/), [Mocha](https://mochajs.org/), and [Jasmine](https://jasmine.github.io/) and even [Cucumber](https://www.npmjs.com/package/@cucumber/cucumber)

It is highly recommended to use it with a [WDIO Testrunner](https://webdriver.io/docs/clioptions) which provides additional auto-configuration for a plug-and-play experience.

When used <u>**outside of [WDIO Testrunner](https://webdriver.io/docs/clioptions)**</u>, types need to be added to your [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), and some additional configuration for WDIO matchers, soft assertions, and snapshot service is required.

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

If you are NOT using WDIO Testrunner, some prerequisite configuration is required.

Option 1: Replace the expect globally with the `expect-webdriverio` one:
```ts
import { expect } from "expect-webdriverio";
(globalThis as any).expect = expect;
```

Option 2: Reconfigure Jest's expect with the custom matchers and the soft assertion:
```ts
// Configure the custom matchers:
import { expect } from "@jest/globals";
import { matchers } from "expect-webdriverio";

beforeAll(async () => { 
    expect.extend(matchers as Record<string, any>);
});
```

[Optional] For the soft assertion, the `createSoftExpect` is currently not correctly exposed but the below works:
```ts
// @ts-ignore
import * as createSoftExpect from "expect-webdriverio/lib/softExpect";

beforeAll(async () => {
  Object.defineProperty(expect, "soft", {
    value: <T = unknown>(actual: T) => createSoftExpect.default(actual),
  });

  // Add soft assertions utility methods
  Object.defineProperty(expect, "getSoftFailures", {
    value: (testId?: string) => SoftAssertService.getInstance().getFailures(testId),
  });

  Object.defineProperty(expect, "assertSoftFailures", {
    value: (testId?: string) => SoftAssertService.getInstance().assertNoFailures(testId),
  });

  Object.defineProperty(expect, "clearSoftFailures", {
    value: (testId?: string) => SoftAssertService.getInstance().clearFailures(testId),
  });
});
```

Then as shown below, no imports are required and we can use WDIO matchers directly on Jest's `expect`:
```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
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
When not using `@wdio/globals/types` or having `@types/jasmine` before it, the Jasmine expect is shown as the global ambient type. Therefore, when also defining `expect-webdriverio/jasmine`, we can use WDIO custom matchers on the `expectAsync`. Without `@wdio/jasmine-framework`, matchers will need to be registered manually.

```ts
describe('My tests', async () => {

    it('should verify my browser to have the expected url', async () => {
        await expectAsync(browser).toHaveUrl('https://example.com')
        await expectAsync(true).toBe(true)
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

#### Global `expectAsync` force as `expect`
When the global ambiant is the `expect` of wdio but forced to be `expectAsync` under the hood, like when using `@wdio/jasmine-framework`, then even the basic matchers need to be awaited 

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expect(browser).toHaveUrl('https://example.com')

        // Even basic matchers requires expect since they are promises underneath
        await expect(true).toBe(true)
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      "@wdio/globals/types",
      "@wdio/jasmine-framework",
      "@types/jasmine",
      "expect-webdriverio/jasmine-wdio-expect-async", // Force expect to return Promises
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
        await wdioExpect(browser).toHaveUrl('https://example.com')

        // No required await
        wdioExpect(true).toBe(true)        
    })
})     


Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
        "@types/jasmine",
        // "expect-webdriverio/expect-global", // Optional to have the global ambient expect the one of wdio
      ]
  }
}
```


#### Asymmetric matchers
Asymmetric matchers have limited support. Even though `jasmine.stringContaining` does not produce a typing error, it may not work even with `@wdio/jasmine-framework`. However, the example below should work:

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
    })
})     
```


### Jest & Jasmine Augmentation Notes

If you are already using Jest or Jasmine globally, using `import { expect } from 'expect-webdriverio'` is the most compatible approach, even though augmentation exists.
It is recommended to build your project using this approach instead of relying on augmentation, to ensure future compatibility and avoid augmentation limitations. See [this issue](https://github.com/webdriverio/expect-webdriverio/issues/1893) for more information.

### Cucumber

More details to come. In short, when paired with `@wdio/cucumber-framework`, you can use WDIO's expect with Cucumber and even [Gherkin](https://www.npmjs.com/package/@cucumber/gherkin).