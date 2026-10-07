import { browser, $ } from '@wdio/globals'

// WebdriverIO v10: `$()` rejects when the selector matches several elements. The page has 2 `h1`.
describe('Strict $()', () => {
    const strictError = 'strict mode violation: `$("h1")` resolved to 2 elements, expected 1.'

    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    it('rejects with the WebdriverIO error, not a failed assertion', async () => {
        const assertion = expect($('h1')).toBeDisplayed()

        await expect(assertion).rejects.toThrow(strictError)
        await expect(assertion).rejects.toMatchObject({ name: 'StrictSelectorError', matches: 2, selector: 'h1' })
    })

    it('rejects with `.not`, so it does not pass', async () => {
        await expect(expect($('h1')).not.toBeExisting({ wait: 0 })).rejects.toThrow(strictError)
    })

    it('passes with `{ strict: false }`, on the first element', async () => {
        await expect($('h1', { strict: false })).toHaveText('WebdriverJS Testpage')
    })
})
