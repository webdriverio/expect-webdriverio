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

### Using WebdriverIO Testrunner

If you run your tests through the [WDIO testrunner](https://webdriver.io/docs/clioptions) no additional setup is needed. WebdriverIO initialises `expect-webdriverio` and makes `expect` available in the global scope. So you can use it directly in your tests:

```js
const $button = await $('button')
await expect($button).toBeDisplayed()
```

See more [Examples](docs/Examples.md)

### Using in a standalone script

If you embed WebdriverIO in a standalone script, make sure you import `expect-webdriverio` before you use it anywhere.

```js
import { remote } from 'webdriverio'
import { expect } from 'expect-webdriverio'

;(async () => {
    const browser = await remote({
        capabilities: {
            browserName: 'chrome'
        }
    })

    await browser.url('https://webdriver.io')

    const $button = await browser.$('button')
    await expect($button).toBeDisplayed()
    
    await browser.deleteSession()
})().catch(console.error)
```

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
