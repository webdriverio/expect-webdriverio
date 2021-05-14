# expect-webdriverio

[![Test](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml/badge.svg)](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml)

###### [API](docs/API.md) | [TypeScript / JS Autocomplete](/docs/Types.md) | [Examples](docs/Examples.md) | [Extending Matchers](/docs/Extend.md)

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
before () { // not needed in WebdriverIO v6
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

Please see [API doc](docs/API.md)

## Error messages

Error messages are informative out of the box and contain:

- full element selector, like `$('form').$('input')`
- actual and expected values
- highlight the difference (texts assertions)

![toHaveText](/docs/img/errors/text.png?raw=true "toHaveText")
![toHaveElementClass](/docs/img/errors/class.png?raw=true "toHaveElementClass")

## What's next?

First of all, **feel free to raise an issue with your suggestions or help with PR!**

### Planned

- css matcher
- size matcher
- cookie / localStorage matchers?
- text regex matchers
- multiremote support (if requested)
