# expect-webdriverio

> [WebdriverIO](https://webdriver.io/) Assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- automatically waits for expectation to succeed
- see full element selector in error
- add your own messages
- works in Mocha, Cucumber, Jest
- builtin types for TypeScript and JS autocompletion

## Installation

1. `npm install expect`
2. `npm install expect-webdriverio`

NOTE: [WebdriverIO](https://github.com/webdriverio/webdriverio) `v5.16.11` or higher is required!

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
    before(() => {
        browser.url('https://github.com/mgrybyk/expect-webdriverio')
        
        expect(browser).toHaveUrl('https://github.com/mgrybyk/expect-webdriverio')
        expect(browser).toHaveTitle('expect-webdriverio', { containing: true })
    })

    it('be visible', () => {
        const notVisible = $('body').$$('div')[2].$("not-visible")
        
        // override default wait timeout for expectation to succeed
        expect(notVisible).toExist({ wait: 3000 })
        
        expect(notVisible).toBeVisible({ wait: 0 })
        // fails with error
        // Element "$(`body`).$$(`div`)[2].$(`not-visible`)" is not displayed.
    })

    it('find elements', () => {
        const formInputs = $$('form input')

        // make sure every form element is enabled
        // waits automatically for formInputs to have at least one element
        expect(formInputs).toBeEnabled({ wait: 5000 })

        const selectOptions = $$('form select>option')

        // make sure there is at least one option in select
        expect(selectOptions).toBeElementsArrayOfSize({ gte: 1 })
        // exact match
        expect($$('button')).toBeElementsArrayOfSize(3)
    })

    it('advanced', () => {
        const myInput = $('input')

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
        await expect(el).toBePresent() // aliases toBeExisting or toExist

        // or
        await expect($('el')).toBePresent()
    })
})
``` 

## API

See available [Matchers](https://github.com/mgrybyk/expect-webdriverio/blob/master/types/expect-webdriverio.d.ts#L64)

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

- boilerplate projects

### Coming soon...

- css
- cookie / localStorage ?
- docs

### Also planned

- more matchers
- jasmine support
- advanced matchers with regex
- multiremote support (if requested)
