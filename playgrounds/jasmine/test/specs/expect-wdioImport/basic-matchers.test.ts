import { browser, $, $$ } from '@wdio/globals'
import { expect } from 'expect-webdriverio'

describe('Basic Expect Matchers available when pulling expect from expect-webdriverio directly', () => {
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

    describe('Negation', () => {
        it('should work with not', async () => {
            const title = await browser.getTitle()

            await expect(title).not.toBe('')
            await expect(title).not.toContain('Firefox')
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

    describe('Object matchers', () => {
        it('should match object properties', async () => {
            const capabilities = await browser.capabilities

            await expect(capabilities).toHaveProperty('browserName')
            await expect(capabilities).toMatchObject({
                browserName: 'chrome'
            })
        })
    })

    describe('Async/Promise matchers', () => {
        it('should handle promises', async () => {
            const titlePromise = browser.getTitle()

            await expect(titlePromise).resolves.toContain('WebdriverIO')
        })

        it('should not reject', async () => {
            const urlPromise = browser.getUrl()

            await expect(urlPromise).resolves.toBeDefined()
        })
    })

    describe('Basis matcher with Jasmine asymmetric matchers', () => {
        it('should have toEqual work with jasmine.stringContaining', async () => {
            expect('title').toEqual(jasmine.stringContaining('title'))
        })

        it('should have toEqual work with jasmine.any', async () => {
            expect('title').toEqual(jasmine.any(String))
            expect(123).toEqual(jasmine.any(Number))
        })

        // TODO to support one day?
        xit('should have toEqual work with jasmine.objectContaining', async () => {
            expect({ a: 1, b: 2 }).toEqual(jasmine.objectContaining({ a: 1 }))
        })

        // TODO to support one day?
        xit('should have toEqual work with jasmine.arrayContaining', async () => {
            expect([1, 2, 3]).toEqual(jasmine.arrayContaining([2]))
        })

        it('should have toEqual work with jasmine.stringMatching', async () => {
            expect('title').toEqual(jasmine.stringMatching(/itl/))
        })

        it('should have toEqual work with jasmine.anything', async () => {
            expect({ foo: 'bar' }).toEqual({ foo: jasmine.anything() })
        })

        it('should have toBe not work with stringContaining', async () => {
            expect(() => {
                expect('title').toBe(jasmine.stringContaining('title'))
            }).toThrow()
        })
    })

    describe('Basis matcher with asymmetric matchers', () => {
        it('should have toEqual work with expect.stringContaining', async () => {
            expect('title').toEqual(expect.stringContaining('title'))
        })

        it('should have toEqual work with expect.any', async () => {
            expect('title').toEqual(expect.any(String))
            expect(123).toEqual(expect.any(Number))
        })

        it('should have toEqual work with expect.objectContaining', async () => {
            expect({ a: 1, b: 2 }).toEqual(expect.objectContaining({ a: 1 }))
        })

        it('should have toEqual work with expect.arrayContaining', async () => {
            expect([1, 2, 3]).toEqual(expect.arrayContaining([2]))
        })

        it('should have toEqual work with expect.stringMatching', async () => {
            expect('title').toEqual(expect.stringMatching(/itl/))
        })

        it('should have toEqual work with expect.anything', async () => {
            expect({ foo: 'bar' }).toEqual({ foo: expect.anything() })
        })

        it('should have toEqual work with expect.closeTo', async () => {
            expect({ num: 1.1 }).toEqual({ num: expect.closeTo(1.101, 2) })
        })

        it('should have toBe not work with stringContaining', async () => {
            expect(() => {
                expect('title').toBe(expect.stringContaining('title'))
            }).toThrow()
        })
    })
})
