## Custom Matchers

`expect-webdriverio` registers WebdriverIO custom matchers out of the box for a seamless experience.

To use WebdriverIO custom matchers (except asymmetric matchers) directly in:
- **Jest**: Register matchers manually with `expect.extend`.
- **Jasmine**: Using `@wdio/jasmine-framework` provides an out-of-the-box experience.
    - Else, register matchers manually with `jasmine.addAsyncMatchers`, then they will be available on `expectAsync`.
- **Types**: Type augmentation for custom matchers is provided. See [Types.md](Types.md) for details.

### Adding your own matchers

Similar to how `expect-webdriverio` provide custom matchers it's possible to add your own custom matchers.

- [Jasmine](https://jasmine.github.io/) see [custom matchers](https://jasmine.github.io/tutorials/custom_matchers) doc
- Everyone else see [Jest's expect.extend](https://jestjs.io/docs/expect#expectextendmatchers)

Custom matchers should be added in wdio `before` hook

```js
// wdio.conf.js
{
    async before () {
        const { addCustomMatchers } = await import('./myMatchers')
        addCustomMatchers()
    }
}
```

```js
// myMatchers.js - Jest example
export function addCustomMatchers () {
    expect.extend({
        myMatcher (actual, expected) {
            return { pass: actual === expected, message: () => 'some message' }
        }
    })
}
```

### TypeScript

Add the types of your matchers to the `ExpectWebdriverIO` namespace. It works with every framework: the types of `expect-webdriverio/jest` and of `expect-webdriverio/jasmine` (and `@wdio/jasmine-framework`) extend it, also for `expect.soft()`.

```ts
// my-matchers.d.ts, or any .ts file of your project
declare global {
    namespace ExpectWebdriverIO {
        interface Matchers<R, T> {
            // A matcher for any value
            toBeWithinRange(floor: number, ceiling: number): R
            // An async matcher for elements only: `never` blocks it on other values
            toHaveDataState: T extends ChainablePromiseElement | WebdriverIO.Element
                ? (state: string | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.CommandOptions) => Promise<R>
                : never
        }

        interface AsymmetricMatchers {
            // The asymmetric form: `expect.toBeWithinRange(1, 10)`
            toBeWithinRange(floor: number, ceiling: number): ExpectWebdriverIO.PartialMatcher<number>
        }
    }
}

export {}
```

- `Matchers` takes both type parameters, `<R, T>`, as in `expect-webdriverio`: `R` is the return type of the assertion, and `T` is the type of the value given to `expect()`. With `Matchers<R>` only, TypeScript fails: `All declarations of 'Matchers' must have identical type parameters`.
- An async matcher, which waits for the element, returns `Promise<R>`. A matcher that compares a value at once returns `R`.
- `ExpectWebdriverIO.PartialMatcher` takes the type of the value, e.g. `PartialMatcher<string>`.
- In a file with an `import` or an `export` (a module), put the namespace in `declare global { … }`, and end with `export {}` when the file has no other export. In a `.d.ts` file with no `import` and no `export`, write `declare namespace ExpectWebdriverIO { … }` directly.
- Use the public types: `ExpectWebdriverIO.*` (also as named exports of `expect-webdriverio`), `WebdriverIO.Element`, and the 2 global names `ChainablePromiseElement` and `ChainablePromiseArray` (the types of a not-awaited `$()` and `$$()`, from `webdriverio`). The other helper types of `expect-webdriverio` are not global.
- With Jest, you can also add the types to the `expect` module (`declare module 'expect' { interface Matchers<R, T> { … } }`), or to the `jest` namespace. The `jest` namespace does not type `expect.soft()`.

