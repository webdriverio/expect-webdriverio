# Custom Matchers

`expect-webdriverio` registers WebdriverIO custom matchers out of the box for a seamless experience.

To use WebdriverIO custom matchers (except asymmetric matchers) directly in:
- **Jest**: Register matchers manually with `expect.extend`.
- **Jasmine**: Register matchers manually with `jasmine.addAsyncMatchers`, then they will be available on `expectAsync`.
    - Using `@wdio/jasmine-framework` provides a similar out-of-the-box experience.
- **Types**: Type augmentation for custom matchers is provided. See [Types.md](Types.md) for details.

## Adding your own matchers

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
    if (global.expect.expect !== undefined) { // Temporary workaround. See https://github.com/webdriverio/expect-webdriverio/issues/835
        global.expect = global.expect.expect;
    }

    expect.extend({
        myMatcher (actual, expected) {
            return { pass: actual === expected, message: () => 'some message' }
        }
    })
}
```
