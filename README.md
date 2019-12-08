# expect-webdriverio

> [WebdriverIO](https://webdriver.io/) Assertion library inspired by [expect](https://www.npmjs.com/package/expect)

## Key Features

- automatically waits for expectation to succeed
- see full element selector in error
- add your own messages
- works in Mocha, Cucumber, Jest, Jasmine
- builtin types for TypeScript and JS autocompletion

## Installation

1. `npm install expect` (**Jasmine** and **Jest** users should skip this step)
2. `npm install expect-webdriverio`

NOTE: [WebdriverIO](https://github.com/webdriverio/webdriverio) `v5.16.11` or higher is required!

## Usage

In your `wdio.conf.js`
```js
beforeSession () { // before hook works as well
    // with default options
    require('expect-webdriverio')
    // If you like to override default options
    // require('expect-webdriverio').setOptions({ wait: 9000 })
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
        
        // wait for 2000ms for expectation to succeed by default
        expect(notVisible).toExist()

        // override default wait timeout        
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

        // Jasmine users should use expectAsync instead of expect!!
        await expect(el).toBePresent() // aliases toBeExisting or toExist

        // or
        await expect($('el')).toBePresent()
    })
})
``` 

## API

See available [Matchers](https://github.com/mgrybyk/expect-webdriverio/blob/master/types/expect-webdriverio.d.ts#L64)

Besides of the `expect-webdriverio` matchers you can use builtin Jest's [expect](https://jestjs.io/docs/en/expect) assertions or [expect/expectAsync](https://jasmine.github.io/api/3.5/global.html#expect) for Jasmine.

## Default Options

Options will be extended soon to provide more flexibility!

```js
{
    wait: 2000, // ms to wait for expectation to succeed
    interval: 100, // interval between attempts
}
```

## TypeScript

Add expect-webdriverio to `types` in the `tsconfig.json`
- `"expect-webdriverio"` for everyone except of Jasmine/Jest users.
- `"expect-webdriverio/jasmine"` Jasmine
- `"expect-webdriverio/jest"` Jest
- `"expect-webdriverio/types/standalone-global"` to use as an additional expectation lib (not recommended)

## Error messages

Error messages are informative out of the box and contain:

- full element selector
- property type to be verified
- actual and expected values
- highlight the difference (texts assertions)

#### Examples
![toHaveClass](/docs/img/errors/toHaveClass.png?raw=true "toHaveClass")

## What's next?

First of all, **feel free to raise an issue with your suggestions or help with PR!**

New features and improvements, of course!

### Almost there

- boilerplate projects

### Coming soon...

- css
- size
- cookie / localStorage ?
- docs

### Also planned

- more matchers
- advanced matchers with regex
- multiremote support (if requested)
