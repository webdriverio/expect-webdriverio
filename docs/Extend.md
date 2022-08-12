## Adding your own matchers

Similar to how `expect-webdriverio` extends Jasmine/Jest matchers it's possible to add custom matchers.

- Jasmine see [custom matchers](https://jasmine.github.io/2.5/custom_matcher.html) doc
- Everyone else see Jest's [expect.extend](https://jestjs.io/docs/en/expect#expectextendmatchers)

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
