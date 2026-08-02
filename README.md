# expect-webdriverio [![Test](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml/badge.svg)](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml)


###### [API](docs/API.md) | [TypeScript / JS Autocomplete](docs/Types.md) | [Examples](docs/Examples.md) | [Extending Matchers](docs/CustomMatchers.md)

> [WebdriverIO](https://webdriver.io/) Assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- [Waits](#default-options) for expectation to succeed
- Support single element & multi-elements
- Detailed [error messages](#error-messages)
- Works in Mocha, Cucumber, Jest, Jasmine
- Builtin [types](docs/Types.md) for TypeScript and JS autocompletion

## Installation

1. `npm install expect-webdriverio`
2. `npm install @wdio/mocha-framework` -- Choose your framework mocha being the default one!
   - **Jasmine**: `npm install @wdio/jasmine-framework`
   - **Cucumber**: `npm install @wdio/cucumber-framework`
   - **Jest**: None, manual configuration requires, see [Jest Framework section](docs/Framework.md#jest) 
3. Configure you tsc configuration, see [Types](docs/Types.md#typescript)

NOTE: [WebdriverIO](https://github.com/webdriverio/webdriverio) `v9.0.0` or higher is required!

## Usage

### Using WebdriverIO Testrunner

If you run your tests through the [WDIO testrunner](https://webdriver.io/docs/clioptions) no additional setup is needed. WebdriverIO initialises `expect-webdriverio` and makes `expect` available in the global scope. So you can use it directly in your tests:

```js
const button = await $('button')
await expect(button).toBeDisplayed()
```

See more [Examples](docs/Examples.md)

### Using in a standalone script

If you embed WebdriverIO in a standalone (without `@wdio/globals`), make sure you import `expect-webdriverio` before you use it anywhere.

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

- cookie
- multiremote support (coming)
