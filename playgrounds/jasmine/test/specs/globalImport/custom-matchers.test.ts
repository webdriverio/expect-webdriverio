import { browser } from '@wdio/globals'

// Since `@wdio/jasmine-framework` 10.0.2, `expect.extend()` adds custom matchers to the global `expect`. The framework
// reads them before the first `beforeAll()` of the specs, so the call is at the top level of the file.
// The types of the matchers are in `test/customMatchers.d.ts`.
// @ts-expect-error `@wdio/jasmine-framework` 10.0.2 has `expect.extend()` at runtime, but not in the types of the global `expect`
expect.extend({
    toBeEven(actual: number) {
        return { pass: actual % 2 === 0, message: () => `expected ${actual} to be even` }
    },
    async toHaveTitleLength(received: WebdriverIO.Browser, length: number) {
        const title = await received.getTitle()
        return { pass: title.length === length, message: () => `expected the title "${title}" to have ${length} characters` }
    },
})

describe('Custom matchers with expect.extend()', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    it('runs a sync custom matcher', async () => {
        await expect(2).toBeEven()
        await expect(3).not.toBeEven()
    })

    it('runs an async custom matcher', async () => {
        await expect(browser).toHaveTitleLength('WebdriverJS Testpage'.length)
        await expect(browser).not.toHaveTitleLength(1)
    })
})
