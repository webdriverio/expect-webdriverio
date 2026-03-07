import { browser, $, $$ } from '@wdio/globals'

describe('Basic Expect Matchers', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io')
    })

    describe('Boolean matchers', () => {
        it('should verify truthy values', async () => {
            const element = await $('.navbar')
            const isDisplayed = await element.isDisplayed()

            await expect(isDisplayed).toBe(true)
            await expect(isDisplayed).toBeTruthy()
        })

        it('should verify falsy values', async () => {
            const element = await $('.non-existent-element')
            const exists = await element.isExisting()

            await expect(exists).toBe(false)
            await expect(exists).toBeFalsy()
        })
    })

    describe('String matchers', () => {
        it('should match exact text', async () => {
            const title = await browser.getTitle()
            await expect(title).toContain('WebdriverIO')
        })

        it('should match with regex', async () => {
            const url = await browser.getUrl()
            await expect(url).toMatch(/^https:\/\/webdriver\.io/)
        })
    })

    describe('Number matchers', () => {
        it('should compare numbers', async () => {
            const navLinks = await $$('nav a')
            const count = navLinks.length

            await expect(count).toBeGreaterThan(5)
            await expect(count).toBeGreaterThanOrEqual(6)
            await expect(count).toBeLessThan(100)
            await expect(count).toBeLessThanOrEqual(50)
        })
    })

    describe('Array matchers', () => {
        it('should verify array contents', async () => {
            const navLinks = await $$('nav a')
            const hrefs: string[] = []
            for (const link of navLinks) {
                hrefs.push(await link.getAttribute('href'))
            }

            await expect(hrefs).toBeInstanceOf(Array)
            await expect(hrefs.length).toBeGreaterThan(0)
            await expect(hrefs).toEqual(expect.arrayContaining(['/docs/gettingstarted']))
        })
    })

    // TODO failing with  TypeError: await expect(...).toHaveProperty is not a function
    xdescribe('Object matchers', () => {
        it('should match object properties', async () => {
            const capabilities = await browser.capabilities

            await expect(capabilities).toHaveProperty('browserName')
            await expect(capabilities).toMatchObject({
                browserName: 'chrome'
            })
        })
    })

    describe('Negation', () => {
        it('should work with not', async () => {
            const title = await browser.getTitle()

            await expect(title).not.toBe('')
            await expect(title).not.toContain('Firefox')
        })
    })

    xdescribe('Async/Promise matchers', () => {
        it('should handle promises', async () => {
            const titlePromise = browser.getTitle()

            // @ts-expect-error -- resolves should not exists on expect
            await expect(titlePromise).resolves.toContain('WebdriverIO')
        })

        it('should not reject', async () => {
            const urlPromise = browser.getUrl()

            // @ts-expect-error -- rejects should not exists on expect
            await expect(urlPromise).resolves.toBeDefined()
        })
    })
})
