# expect-webdriverio

> [WebdriverIO](https://webdriver.io/) Assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- human readable syntax
- waits for expectation to succeed
- adopted and customizable error messages
- works in Mocha, Cucumber, Jest
- builtin types for TypeScript and JS autocompletion

## Installation

1. `npm install expect`
2. `npm install expect-webdriverio`

NOTE: [WebdriverIO](https://github.com/webdriverio/webdriverio) v5 or higher is required.

## Usage

In your `wdio.conf.js`
```js
beforeSession () {
    // with default options
    require('expect-webdriverio')
    // If you like to override default options
    require('expect-webdriverio').setOptions({ wait: 9000 })
},
```

In your test
```js
describe('suite', () => {
    it('be visible', () => {
        const notVisible = $('body').$$('div')[2].$("not-visible")
        expect(notVisible).toExist() // aliases toBeExisting or toBePresent
        expect(notVisible).toBeVisible({ wait: 0 }) // alias toBeDisplayed
        // fails with error
        // Element "$(`body`).$$(`div`)[2].$(`not-visible`)" is not displayed.
    })
    it('advanced', () => {
        const myInput = $('input')
        expect(myInput).toBeEnabled({ now: true }) // same as { wait: 0 }

        expect(myInput).toHaveClass('form-control', { message: 'Not a form control!', })
        expect(myInput).toHaveAttribute('class', 'form-control') // alias toHaveAttr
        
        expect(myInput).toHaveValueContaining('USER')
        // or pass `containing` as an option
        expect(myInput).toHaveValue('value', 'user', { containing: true, ignoreCase: true })

        // Simply invert assertions
        expect(myInput).not.toHaveProperty('height', 0)
    })

    it('async mode', async () => {
        const el = await $('el')
        await expect(el).toBePresent()

        // or
        await expect($('el')).toBePresent()
    })
})
``` 

## API

See available [Matchers](https://github.com/mgrybyk/expect-webdriverio/blob/master/types/expect-webdriverio.d.ts)

Besides of `expect-webdriverio` assertions you can use builtin [expect assertions](https://jestjs.io/docs/en/expect).

## Default Options

Options will be extended soon to provide more flexibility!

```js
{
    wait: 2000, // ms to wait for expectation to succeed
    interval: 100, // interval between attempts
}
```

## Error messages

Error messages are informative out of the box and contain:

- full element selector
- property type to be verified
- actual and expected values
- highlight the difference (texts assertions)

Examples
![toHaveClass](/docs/img/errors/toHaveClass.png?raw=true "toHaveClass")

## What's next?

First of all, **feel free to raise an issue with your suggestions or help with PR!**

New features and improvements, of course!

### Almost there

- `$$` support

### Coming soon...

- better text comparison error messages
- css
- cookie / localStorage ?
- docs
- boilerplate projects

### Also planned
- advanced matchers with regex
- jasmine support
- better multiremote support (if requested)
