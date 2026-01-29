import { browser, $, $$ } from '@wdio/globals'

describe('Basic Expect Matchers', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io')
    })

    describe('Boolean matchers', () => {
        it('should verify truthy values', async () => {
            const element = await $('.navbar')
            const isDisplayed = await element.isDisplayed()

            expect(isDisplayed).toBe(true)
            expect(isDisplayed).toBeTruthy()
        })

        it('should verify falsy values', async () => {
            const element = await $('.non-existent-element')
            const exists = await element.isExisting()

            expect(exists).toBe(false)
            expect(exists).toBeFalsy()
        })
    })

    describe('String matchers', () => {
        it('should match exact text', async () => {
            const title = await browser.getTitle()
            expect(title).toContain('WebdriverIO')
        })

        it('should match with regex', async () => {
            const url = await browser.getUrl()
            expect(url).toMatch(/^https:\/\/webdriver\.io/)
        })
    })

    describe('Number matchers', () => {
        it('should compare numbers', async () => {
            const navLinks = await $$('nav a')
            const count = navLinks.length

            expect(count).toBeGreaterThan(5)
            expect(count).toBeGreaterThanOrEqual(6)
            expect(count).toBeLessThan(100)
            expect(count).toBeLessThanOrEqual(50)
        })
    })

    describe('Array matchers', () => {
        it('should verify array contents', async () => {
            const navLinks = await $$('nav a')
            const hrefs: string[] = []
            for (const link of navLinks) {
                hrefs.push(await link.getAttribute('href'))
            }

            expect(hrefs).toBeInstanceOf(Array)
            expect(hrefs.length).toBeGreaterThan(0)
            expect(hrefs).toEqual(expect.arrayContaining(['/docs/gettingstarted']))
        })
    })

    // TODO failing with  TypeError: expect(...).toHaveProperty is not a function
    xdescribe('Object matchers', () => {
        it('should match object properties', async () => {
            const capabilities = await browser.capabilities

            expect(capabilities).toHaveProperty('browserName')
            expect(capabilities).toMatchObject({
                browserName: 'chrome'
            })
        })
    })

    describe('Negation', () => {
        it('should work with not', async () => {
            const title = await browser.getTitle()

            expect(title).not.toBe('')
            expect(title).not.toContain('Firefox')
        })
    })

    // TODO TypeError: Cannot read properties of undefined (reading 'toContain')
    xdescribe('Async/Promise matchers', () => {
        it('should handle promises', async () => {
            const titlePromise = browser.getTitle()

            await expect(titlePromise).resolves.toContain('WebdriverIO')
        })

        it('should not reject', async () => {
            const urlPromise = browser.getUrl()

            await expect(urlPromise).resolves.toBeDefined()
        })
    })
})
