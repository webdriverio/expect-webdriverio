# expect-webdriverio

[![Build Status](https://travis-ci.org/mgrybyk/expect-webdriverio.svg?branch=master)](https://travis-ci.org/mgrybyk/expect-webdriverio)

###### [TypeScript / JS Autocomplete](/docs/Types.md) | [Examples](docs/Examples.md) | [Extending Matchers](/docs/Extend.md)

> [WebdriverIO](https://webdriver.io/) Assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- [waits](#default-options) for expectation to succeed
- detailed [error messages](#error-messages)
- works in Mocha, Cucumber, Jest, Jasmine
- builtin [types](docs/Types.md) for TypeScript and JS autocompletion

## Installation

1. `npm install expect` (**Jasmine** and **Jest** users should skip this step)
2. `npm install expect-webdriverio`

NOTE: [WebdriverIO](https://github.com/webdriverio/webdriverio) `v5.16.11` or higher is required!

## Usage

In your `wdio.conf.js`
```js
beforeSession () { // before hook works as well
    require('expect-webdriverio')
},
```

In your test
```js
const $button = $('button')
expect($button).toBeDisplayed()
```

See more [Examples](docs/Examples.md)

## API

See available [Matchers](https://github.com/mgrybyk/expect-webdriverio/blob/master/types/expect-webdriverio.d.ts#L64)

Besides of the `expect-webdriverio` matchers you can use builtin Jest's [expect](https://jestjs.io/docs/en/expect) assertions or [expect/expectAsync](https://jasmine.github.io/api/3.5/global.html#expect) for Jasmine.

## Default Options

```js
{
    wait: 2000, // ms to wait for expectation to succeed
    interval: 100, // interval between attempts
}
```

Set options like this:
```js
beforeSession () { // before hook works as well
    require('expect-webdriverio').setOptions({ wait: 5000 })
},
```

## Error messages

Error messages are informative out of the box and contain:

- full element selector, like `$('form').$('input')`
- actual and expected values
- highlight the difference (texts assertions)

![toHaveText](/docs/img/errors/text.png?raw=true "toHaveText")
![toHaveClass](/docs/img/errors/class.png?raw=true "toHaveClass")
![not.toBeVisible](/docs/img/errors/not-visible.png?raw=true "not.toBeVisible")

## What's next?

First of all, **feel free to raise an issue with your suggestions or help with PR!**

### Planned

- css matcher
- size matcher
- cookie / localStorage matchers?
- text regex matchers
- multiremote support (if requested)
