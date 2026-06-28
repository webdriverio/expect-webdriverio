# Expect-WebDriverIO Framework

`expect-webdriverio` extends Jest's [`expect`](https://www.npmjs.com/package/expect) API with WebDriverIO-specific enhancements. It can be used standalone or within other testing environments.

## Compatibility

It is highly recommended to use this package with the [WDIO Testrunner](https://webdriver.io/docs/clioptions) and a compatible framework adapter, which together provide a plug-and-play experience.

Pair it with your preferred framework using the appropriate adapter:
- **[Mocha](https://mochajs.org/):** Use [`@wdio/mocha-framework`](https://www.npmjs.com/package/@wdio/mocha-framework)
- **[Cucumber](https://www.npmjs.com/package/@cucumber/cucumber):** Use [`@wdio/cucumber-framework`](https://www.npmjs.com/package/@wdio/cucumber-framework)
- **[Jasmine](https://jasmine.github.io/):** Use [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) 
- **[Jest](https://jestjs.io/):** Works (no framework exists; requires manual configuration—see note below)

> **Note:** When using **Jest**, or when running **outside of the WDIO Testrunner without a compatible framework adapter**, additional manual configuration can be required, such as adding types to your [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) and configuring WDIO matchers, soft assertions, and the snapshot service.
    
### Mocha
When pairing with [Mocha](https://mochajs.org/), you can use `expect-webdriverio` directly or combine it with [`chai`](https://www.chaijs.com/) (or any other assertion library).
- It is strongly recommended to leverage `@wdio/mocha-framework` for automatic configuration and a plug-and-play experience.

#### Standalone
No import is required; everything is set globally.

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expect(browser).toHaveUrl('https://example.com')
    })
})     
```

Minimum types expected in `tsconfig.json`:

When depending on `@wdio/mocha-framework`
```json
{
  "compilerOptions": {
    "types": [
        "@wdio/mocha-framework",
        "@wdio/globals/types"
      ]
  }
}
```

When not depending on `@wdio/mocha-framework`
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

### Jest
We can use `expect-webdriverio` with [Jest](https://jestjs.io/) using [`@types/jest`](https://www.npmjs.com/package/@types/jest) (which has global ambient support) or [`@jest/globals`](https://www.npmjs.com/package/@jest/globals) (no playground yet)
  - Note: Jest maintainers do not support [`@types/jest`](https://www.npmjs.com/package/@types/jest). If this library gets out of date or has problems, support might be dropped.
  - Note: With Jest, the matchers `toMatchSnapshot` and `toMatchInlineSnapshot` are overloaded. To resolve the types correctly, `expect-webdriverio/jest` must be last.
  - Wdio provider no runner 

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
import { wdioCustomMatchers } from "expect-webdriverio";

beforeAll(async () => { 
    expect.extend(wdioCustomMatchers);
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
        "expect-webdriverio/jest" // Must be last for overloaded matchers `toMatchSnapshot` and 
      ]
  }
}
```

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

### Jasmine
When paired with [Jasmine](https://jasmine.github.io/), [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) is also required to configure it correctly, as it forces `expect` to be `expectAsync` and also register the WDIO matchers with `addAsyncMatcher` 
    - `expect-webdriverio` only register using the Jest's style `expect.extend` version which does not work for Jasmine.

Jasmine differs from other assertion libraries in two key ways:
1. Jasmine performs soft assertions by default, collecting failures and only failing the test at the end. Because of this, the SoftAssertion service is not needed or supported.
2. Forcing `expectAsync` as `expect` (by `@wdio/jasmine-framework`) makes even basic matchers asynchronous. However, since Jasmine handles all promises at the end of the test, assertions appear to work properly—unlike in other frameworks, where using `await` is mandatory for correct behavior.
 - Note: This goes against [this recommendation](https://jasmine.github.io/api/edge/async-matchers) and could cause unexpected issues.

The types `expect-webdriverio/jasmine` are still offered but are subject to removal or being moved into `@wdio/jasmine-framework`. The usage of `expectAsync` is also subject to future removal.

#### Global `expectAsync` force as `expect`
When the global ambient `expect` is actually `expectAsync` under the hood (as with `@wdio/jasmine-framework`), it is recommended to `await` even basic matchers, even though Jasmine will handle any un-awaited assertions at the end of the test.

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expect(browser).toHaveUrl('https://example.com')

        // Even basic matchers should have `await` since they are promises underneath
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
      // Force expect to return Promises (In beta testing, expect breaking changes, will move into @wdio/jasmine-framework one day)
      "expect-webdriverio/jasmine-wdio-expect-async",
      "@types/jasmine",
    ]
  }
}
```

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
Jasmine's asymmetric matchers got better but limitation can still exits. 
- `jasmine.stringContaining`; `jasmine.stringMatching`; `jasmine.any(Type)` & `jasmine.anything()` works across the board
- Network matchers does support `jasmine.objectContaining` while supports in other area like element matchers might be limited.
- Wdio asymmmetrics matchers does work properly too

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        // Working Jasmine asymmetric matcher
        await expectAsync(browser).toHaveUrl(jasmine.stringContaining('WebdriverIO'))
        await expectAsync(browser).toHaveUrl(jasmine.stringMatching('/WebdriverIO/'))
        await expectAsync(browser).toHaveUrl(jasmine.any(String))
        await expectAsync(browser).toHaveUrl(jasmine.anything())

        // Working wdio asymmetric matcher
        await expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
    })
})     
```


### Jest & Jasmine Augmentation Notes

If you are already using Jest or Jasmine globally, using `import { expect } from 'expect-webdriverio'` is the most compatible approach, even though augmentation exists.
It is recommended to build your project using this approach instead of relying on augmentation, to ensure future compatibility and avoid augmentation limitations. See [this issue](https://github.com/webdriverio/expect-webdriverio/issues/1893) for more information.

### Cucumber

More details to come. In short, when paired with `@wdio/cucumber-framework`, you can use WDIO's expect with Cucumber and even [Gherkin](https://www.npmjs.com/package/@cucumber/gherkin).
