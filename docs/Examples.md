## Examples

```js
describe('suite', () => {
    before(async () => {
        await browser.url('https://github.com/webdriverio/expect-webdriverio')

        await expect(browser).toHaveUrl('https://github.com/webdriverio/expect-webdriverio')
        await expect(browser).toHaveTitle('expect-webdriverio', { containing: true })
    })

    it('find elements', async () => {
        const formInputs = await $$('form input')

        // make sure every form element is enabled
        // waits automatically for formInputs to have at least one element
        await expect(formInputs).toBeEnabled({ wait: 5000 })

        const selectOptions = await $$('form select>option')

        // make sure there is at least one option in select
        await expect(selectOptions).toBeElementsArrayOfSize({ gte: 1 })
        
        // or pass in an element directly
        await expect($$('button')).toBeElementsArrayOfSize(3)
    })

    it('checks text values', async () => {
        // assert certain text accurate
        const repoTitle = await $('expect-webdriverio')
        await expect(repoTitle).toHaveText('expect-webdriverio')
        // or ignore the case and only check that a substring is present
        await expect(repoTitle).toHaveTextContaining('webdriverio', { ignoreCase: true })
    })

    it('advanced', async () => {
        const myInput = await $('input')

        await expect(myInput).toHaveElementClass('form-control', { message: 'Not a form control!', })
        await expect(myInput).toHaveAttribute('class', 'form-control') // alias toHaveAttr

        await expect(myInput).toHaveValueContaining('USER')
        // or pass `containing` as an option
        await expect(myInput).toHaveValue('value', 'user', { containing: true, ignoreCase: true })

        // Simply invert assertions
        await expect(myInput).not.toHaveElementProperty('height', 0)
    })
})
```

## Boilerplate Projects

WebdriverIO test runner
- Mocha https://github.com/mgrybyk/webdriverio-devtools
- Cucumber https://gitlab.com/bar_foo/wdio-cucumber-typescript
- Jasmine https://github.com/mgrybyk/wdio-jasmine-boilerplate

Standalone
- Jest https://github.com/erwinheitzman/jest-webdriverio-standalone-boilerplate

more boilerplate projects coming soon, feel free to propose yours!
