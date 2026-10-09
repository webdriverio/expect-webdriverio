import { browser, $$ } from '@wdio/globals'
import { expect } from 'expect-webdriverio'

// The `expect` of expect-webdriverio throws on a failure, so each control that must fail is checked with `rejects`.
// With the global `expect` of Jasmine, a failure does not throw: Jasmine collects it.
describe('Jasmine asymmetric matchers in element matchers', () => {
    const options = { wait: 0 }
    let texts: string[]

    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
        texts = await $$('h1').map((h1) => h1.getText())
    })

    describe('on $() and in an array of expected values on $$()', () => {
        it('should match with jasmine.any(), jasmine.anything() and jasmine.is()', async () => {
            await expect($$('h1')[0]).toHaveText(jasmine.any(String))
            await expect($$('h1')[0]).toHaveText(jasmine.anything())
            await expect($$('h1')[0]).toHaveText(jasmine.is(texts[0]))
            await expect(expect($$('h1')[0]).toHaveText(jasmine.is('Other'), options)).rejects.toThrow()
        })

        it('should match with jasmine.stringContaining() and jasmine.stringMatching()', async () => {
            await expect($$('h1')[0]).toHaveText(jasmine.stringContaining('Webdriver'))
            await expect($$('h1')[0]).toHaveText(jasmine.stringMatching(/Testpage$/))
            await expect(expect($$('h1')[0]).toHaveText(jasmine.stringContaining('Other'), options)).rejects.toThrow()
        })

        it('should match with jasmine.truthy(), jasmine.falsy(), jasmine.notEmpty() and jasmine.empty()', async () => {
            await expect($$('h1')[0]).toHaveText(jasmine.truthy())
            await expect($$('h1')[0]).not.toHaveText(jasmine.falsy())
            await expect($$('h1')[0]).toHaveText(jasmine.notEmpty())
            await expect($$('h1')[0]).not.toHaveText(jasmine.empty())
            await expect(expect($$('h1')[0]).toHaveText(jasmine.falsy(), options)).rejects.toThrow()
            await expect(expect($$('h1')[0]).toHaveText(jasmine.empty(), options)).rejects.toThrow()
        })

        it('should match each element with its own matcher', async () => {
            await expect($$('h1')).toHaveText([jasmine.stringContaining('Webdriver'), jasmine.stringMatching(/CSS/)])
            await expect(expect($$('h1')).toHaveText([jasmine.stringMatching(/CSS/), jasmine.stringContaining('Webdriver')], options)).rejects.toThrow()
        })
    })

    describe('on $$() with a list matcher, for the whole list', () => {
        it('should match with jasmine.arrayContaining()', async () => {
            await expect($$('h1')).toHaveText(jasmine.arrayContaining([texts[1]]))
            await expect(expect($$('h1')).toHaveText(jasmine.arrayContaining(['Other']), options)).rejects.toThrow()
        })

        it('should match with jasmine.arrayWithExactContents() in any order', async () => {
            await expect($$('h1')).toHaveText(jasmine.arrayWithExactContents([...texts].reverse()))
            await expect(expect($$('h1')).toHaveText(jasmine.arrayWithExactContents([texts[0]]), options)).rejects.toThrow()
        })

        it('should match with expect.arrayOf()', async () => {
            await expect($$('h1')).toHaveText(expect.arrayOf(jasmine.any(String)))
            await expect(expect($$('h1')).toHaveText(expect.arrayOf(jasmine.stringContaining('Webdriver')), options)).rejects.toThrow()
        })
    })
})
