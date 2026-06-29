# Expect-WebDriverIO Framework

`expect-webdriverio` extends Jest's [`expect`](https://www.npmjs.com/package/expect) API with WebDriverIO-specific enhancements. It can be used standalone or within other testing environments.

## Compatibility

It is highly recommended to use this package with the [WDIO Testrunner](https://webdriver.io/docs/clioptions) and a compatible framework adapter, which together provide a plug-and-play experience.

Pair it with your preferred framework using the appropriate adapter:
- **[Mocha](https://mochajs.org/):** Use [`@wdio/mocha-framework`](https://www.npmjs.com/package/@wdio/mocha-framework)
- **[Cucumber](https://www.npmjs.com/package/@cucumber/cucumber):** Use [`@wdio/cucumber-framework`](https://www.npmjs.com/package/@wdio/cucumber-framework)
- **[Jasmine](https://jasmine.github.io/):** Use [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) 
- **[Jest](https://jestjs.io/):** Works (no framework exists; requires manual configuration—see note below)

> **Note:** When using **Jest**, or when running **outside of the WDIO Testrunner without a compatible framework adapter**, additional manual configuration may be required, such as adding types to your [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) and configuring WDIO matchers, soft assertions, and the snapshot service.

### Playgrounds
Example playgrounds are available, though their `tsconfig.json` files may use modified configurations for development purposes.
- See Mocha, Jasmine, and Jest [examples here](https://github.com/webdriverio/expect-webdriverio/tree/main/playgrounds).

### Mocha
When pairing with [Mocha](https://mochajs.org/), you can use `expect-webdriverio` directly or combine it with [`chai`](https://www.chaijs.com/) (or any other assertion library).
- It is strongly recommended to leverage `@wdio/mocha-framework` for automatic configuration and a plug-and-play experience.
- See [Mocha playground example here](https://github.com/webdriverio/expect-webdriverio/tree/main/playgrounds/mocha)

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
You can use `expect-webdriverio` with [Jest](https://jestjs.io/) by leveraging either [`@types/jest`](https://www.npmjs.com/package/@types/jest) (which provides global ambient support) or [`@jest/globals`](https://www.npmjs.com/package/@jest/globals) alone.
  - Note: Jest maintainers do not officially support [`@types/jest`](https://www.npmjs.com/package/@types/jest). Should this package become outdated or experience issues, support may be dropped.
  - Note: With Jest, the matchers `toMatchSnapshot` and `toMatchInlineSnapshot` are overloaded. To resolve the types correctly, `expect-webdriverio/jest` must be listed last.
  - Note: WebdriverIO does not provide a compatible framework adapter for Jest; manual configuration is required.

#### With `@types/jest`
When paired with [`@types/jest`](https://www.npmjs.com/package/@types/jest), no imports are required in your test files. Global ambient types are already defined correctly, allowing you to use Jest's `expect` directly after some manual configuration.
  - Note: `jest` and `ts-jest` are also required.
  - See the [Jest with `@types/jest` playground example](https://github.com/webdriverio/expect-webdriverio/tree/main/playgrounds/jest).

Since no WDIO Testrunner and framework adapter are used, additional prerequisite configuration is required.

##### Option 1: Replace the global expect with the `expect-webdriverio` instance:
```ts
import { expect } from "expect-webdriverio";
(globalThis as any).expect = expect;
```

##### Option 2: Extend Jest's global `expect` with custom matchers and soft assertions:
If not already set, define a file path for `setupFilesAfterEnv` in your Jest configuration: 
```ts
setupFilesAfterEnv: ['./jest.setup.after-env.ts'],
```
Then, add the following configuration to your `jest.setup.after-env.ts` file:

```ts
import { expect } from "@jest/globals";
import { wdioCustomMatchers } from "expect-webdriverio";

beforeAll(async () => { 
    // Extend the imported Jest expect instance with WDIO matchers
    expect.extend(wdioCustomMatchers);
});
```

##### Optional: For soft assertions, `createSoftExpect` is currently not correctly exposed, but the configuration below works:
```ts
import { SoftAssertService } from "expect-webdriverio";
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


Then, as shown below, no imports are required and we can use WDIO matchers directly on Jest's `expect`:
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

#### With Only `@jest/globals`
When using [`@jest/globals`](https://www.npmjs.com/package/@jest/globals) directly instead of global ambient types, you explicitly import Jest's utilities. To use `expect-webdriverio` you have two approaches:
 - Note: No example playground available

##### Option 1: Explicit Imports
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

##### Option 2: Global Type Definition
To avoid explicitly importing `expect` from `expect-webdriverio` in every test file, add the global entry point to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["expect-webdriverio/expect-global"]
  }
}
```   
##### Augmenting `@jest/globals` JestMatchers
Unlike `@types/jest`, `@jest/globals` does not export a global namespace that can be easily extended. While module augmentation is possible, it does not support inheriting matchers via the extends keyword. Supporting it would require manually duplicating all expect-webdriverio matcher interfaces inside the module declaration.

This limitation is a known [upstream issue](https://github.com/jestjs/jest/issues/12424) tracked in Jest.


### Jasmine
When paired with [Jasmine](https://jasmine.github.io/), [`@wdio/jasmine-framework`](https://www.npmjs.com/package/@wdio/jasmine-framework) is required to ensure proper runtime configuration. The adapter forces the global `expect` to map to Jasmine's native `expectAsync` and registers the necessary WDIO matchers via `addAsyncMatcher`.

Jasmine differs from other standard assertion libraries in two key ways:
1. **Built-in Soft Assertions:** Jasmine executes soft assertions out-of-the-box by tracking and collecting validation failures until a spec block finishes execution. Because this mechanism is native to Jasmine, the `expect-webdriverio` SoftAssertion service is neither required nor supported.
2. **Implicit Promise Handling:** Forcing `expectAsync` to act as the global `expect` binding makes even basic matchers asynchronous. Because Jasmine automatically hooks into outstanding spec promises and flushes them at the end of the test, assertions may *appear* to execute correctly even if you omit the `await` keyword—unlike in other frameworks where `await` is strictly mandatory.

> ⚠️ **Warning:** Omitting `await` directly conflicts with [Jasmine's official async matcher recommendations](https://jasmine.github.io/api/edge/async-matchers) and can introduce silent timing issues or unhandled rejections into your test suite. Always explicitly `await` your assertions.

#### Available Type Definitions
1. **`expect-webdriverio/jasmine`**
   Augments Jasmine's native `expectAsync` interface directly with WebDriverIO custom matchers.

2. **`expect-webdriverio/jasmine-wdio-expect-async`**
   Specifically dedicated to aligning with the `@wdio/jasmine-framework` architecture. This entry point is subject to breaking changes and may be moved directly into the framework adapter in a future release. It performs the following modifications:
   - Augments `expect` with WebDriverIO custom matchers.
   - Transforms synchronous, native Jasmine matchers on the `expect` interface to return promises (making them asynchronous).
   - Establishes a global `expect` type definition with the above modifications.

#### Global `expectAsync` forced as `expect`
When using `@wdio/jasmine-framework`, the global ambient `expect` is forced to behave as Jasmine's native `expectAsync` under the hood. It is strongly recommended to explicitly `await` all assertions—including basic, non-WDIO matchers. While Jasmine automatically processes un-awaited spec promises at the end of test execution, omitting the keyword can introduce unpredictable timing issues or silent validation bypasses.
 - See [example playgrounds](https://github.com/webdriverio/expect-webdriverio/tree/main/playgrounds/jasmine/test/specs/globalImport)

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expect(browser).toHaveUrl('https://example.com')

        // Always await basic assertions as well since they resolve to promises under the hood
        await expect(true).toBe(true)
    })
})     
```

Expected in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": [
      // Enforces Promise-based assertion return types (Beta: Subject to future integration into @wdio/jasmine-framework)  
      "expect-webdriverio/jasmine-wdio-expect-async", 
      
      "@wdio/globals/types",
      "@types/jasmine"
    ]
  }
}
```

> **Warning**: Because `@wdio/jasmine-framework` overrides synchronous matchers and introduces complicated type augmentations, a proposal was made for WebdriverIO v10 to preserve Jasmine's clean `expectAsync` API, attach custom WDIO matchers directly to it, and keep basic matchers synchronous.

> Note: When using Jasmine, Jest's expect matchers are not leveraged, meaning standard Jest-specific assertion matchers are unavailable.

#### Jasmine `expectAsync`
When you do not use `@wdio/globals/types` (or when `@types/jasmine` takes type-resolution priority), the global ambient `expect` resolves to Jasmine's native behavior. By defining `expect-webdriverio/jasmine` in your types, you can use WDIO custom matchers directly on `expectAsync`. Note that if you are running outside of `@wdio/jasmine-framework`, these matchers must be registered manually.

```ts
describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await expectAsync(browser).toHaveUrl('https://example.com')
        
        // Standard Jasmine async matchers work as expected
        await expectAsync(Promise.resolve(true)).toBeResolvedTo(true)
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

#### Use `expect` from `expect-webdriverio`
The `expect` export from `expect-webdriverio` remains available under Jasmine if you prefer an explicit import strategy. See the [playground example](https://github.com/webdriverio/expect-webdriverio/tree/main/playgrounds/jasmine/test/specs/expect-wdioImport).

```ts
import { expect as wdioExpect } from 'expect-webdriverio'

describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        await wdioExpect(browser).toHaveUrl('https://example.com')

        // Does not require await
        wdioExpect(true).toBe(true)        
    })
})     
```

#### Asymmetric matchers
Jasmine's asymmetric matchers have improved, but certain limitations may still exist. 
- `jasmine.stringContaining`, `jasmine.stringMatching`, `jasmine.any(Type)`, and `jasmine.anything()` work seamlessly across the board.
- Network matchers support `jasmine.objectContaining`, whereas support in other areas (such as element matchers) might be limited.
- WDIO asymmetric matchers also work properly.

```ts
import { expect as wdioExpect } from 'expect-webdriverio'

describe('My tests', async () => {
    it('should verify my browser to have the expected url', async () => {
        // Working Jasmine asymmetric matchers
        await expectAsync(browser).toHaveUrl(jasmine.stringContaining('WebdriverIO'))
        await expectAsync(browser).toHaveUrl(jasmine.stringMatching('/WebdriverIO/'))
        await expectAsync(browser).toHaveUrl(jasmine.any(String))
        await expectAsync(browser).toHaveUrl(jasmine.anything())

        // Working WDIO asymmetric matcher
        await expectAsync(browser).toHaveUrl(wdioExpect.stringContaining('WebdriverIO'))
    })
})
```

### Cucumber

More details to come. In short, when paired with [`@wdio/cucumber-framework`](https://www.npmjs.com/package/@wdio/cucumber-framework), you can use WebDriverIO's `expect` library seamlessly within your Cucumber step definitions and [Gherkin-based](https://www.npmjs.com/package/@cucumber/gherkin) tests.
