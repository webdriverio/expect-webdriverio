## Examples

```js
describe('suite', () => {
    before(() => {
        browser.url('https://github.com/webdriverio/expect-webdriverio')

        expect(browser).toHaveUrl('https://github.com/webdriverio/expect-webdriverio')
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

    it('checks text values', () => {
        // assert certain text accurate
        const repoTitle = $('expect-webdriverio')
        expect(repoTitle).toHaveText('expect-webdriverio')
        // or ignore the case and only check that a substring is present
        expect(repoTitle).toHaveTextContaining('webdriverio', { ignoreCase: true })
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

## Boilerplate Projects

WebdriverIO test runner
- Mocha https://github.com/mgrybyk/webdriverio-devtools
- Cucumber https://gitlab.com/bar_foo/wdio-cucumber-typescript
- Jasmine https://github.com/mgrybyk/wdio-jasmine-boilerplate

Standalone
- Jest https://github.com/erwinheitzman/jest-webdriverio-standalone-boilerplate

more boilerplate projects coming soon, feel free to propose yours!
