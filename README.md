# expect-webdriverio [![Test](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml/badge.svg)](https://github.com/webdriverio/expect-webdriverio/actions/workflows/test.yml)

###### [API](docs/API.md) | [TypeScript / JS Autocomplete](docs/Types.md) | [Examples](docs/Examples.md) | [Extending Matchers](docs/CustomMatchers.md)

> [WebdriverIO](https://webdriver.io/) assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- [Waits](#default-options) for expectations to succeed
- Supports single element `$()` & multiple elements `$$()`
- Detailed [error messages](#error-messages)
- Works in Mocha, Cucumber, Jest, and Jasmine
- Built-in [types](docs/Types.md) for TypeScript and JS autocompletion

## Installation

1. `npm install expect-webdriverio`
2. Install your test framework adapter (if not already set up via WDIO testrunner):
   - **Mocha** (default): `npm install @wdio/mocha-framework`
   - **Jasmine**: `npm install @wdio/jasmine-framework`
   - **Cucumber**: `npm install @wdio/cucumber-framework`
   - **Jest**: No adapter needed — see [Jest Framework section](docs/Framework.md#jest)

**Note:** [WebdriverIO](https://github.com/webdriverio/webdriverio) `v9.0.0` or higher is required!

## Usage

### Using WebdriverIO Testrunner

If you run your tests through the [WDIO testrunner](https://webdriver.io/docs/clioptions), no additional setup is needed. WebdriverIO initializes `expect-webdriverio` and makes `expect` available in the global scope so you can use it directly in your tests:

```js
await expect($('button')).toBeDisplayed()
await expect($$('buttons')).toBeDisplayed()
```

See more [Examples](docs/Examples.md).

#### Local & Browser Runners
- **Local Runner**: Fully compatible. You can leverage your test framework adapter as mentioned above.
- **Browser Runner**: Designed for component frameworks like React, Preact, Vue.js, Svelte, and SolidJS, with a few known limitations. For details, see the [Browser Runner Framework section](docs/Framework.md#browser-runner).

### Using in Standalone Mode

If you use WebdriverIO in standalone mode (without `@wdio/globals`), make sure you import `expect-webdriverio` before using it anywhere.

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

Please see the [API documentation](docs/API.md).

## Error Messages

Error messages are informative out of the box and contain:

- Full element selector, like `$('form')`
- Actual and expected values
- Highlighted differences (text assertions)

![toHaveText](/docs/img/errors/text.png?raw=true "toHaveText")
![toHaveElementClass](/docs/img/errors/class.png?raw=true "toHaveElementClass")

## What's Next?

First of all, **feel free to raise an issue with your suggestions or help with PRs!**

### Planned

- Cookie matchers
- Multiremote support (in progress)
