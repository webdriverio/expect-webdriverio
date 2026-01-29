import { browser, $, $$ } from '@wdio/globals'

describe('Jasmine-Specific Features', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io')
    })

    describe('Asymmetric matchers', () => {
        it('should work with jasmine.any()', async () => {
            const title = await browser.getTitle()
            await expect(title).toEqual(jasmine.any(String))
        })

        it('should work with jasmine.anything()', async () => {
            const element = await $('.navbar')
            const text = await element.getText()
            await expect(text).toEqual(jasmine.anything())
        })

        it('should work with jasmine.stringContaining()', async () => {
            const title = await browser.getTitle()
            await expect(title).toEqual(jasmine.stringContaining('WebdriverIO'))
        })

        it('should work with jasmine.stringMatching()', async () => {
            const url = await browser.getUrl()
            await expect(url).toEqual(jasmine.stringMatching(/^https:\/\//))
        })

        it('should work with jasmine.objectContaining()', async () => {
            const capabilities = await browser.capabilities
            await expect(capabilities).toEqual(jasmine.objectContaining({
                browserName: 'chrome'
            }))
        })

        it('should work with jasmine.arrayContaining()', async () => {
            const navLinks = await $$('nav a')
            const hrefs: string[] = []
            for (const link of navLinks) {
                hrefs.push(await link.getAttribute('href'))
            }
            await expect(hrefs).toEqual(jasmine.arrayContaining(['/docs/gettingstarted']))
        })
    })

    describe('Custom matchers with WebdriverIO', () => {
        it('should combine jasmine matchers with wdio matchers', async () => {
            const searchButton = await $('.DocSearch-Button')

            // WebdriverIO matcher
            await expect(searchButton).toExist()

            // Jasmine matcher on element property
            const tagName = await searchButton.getTagName()
            await expect(tagName).toEqual(jasmine.any(String))
            await expect(tagName).toBe('button')
        })

        // TODO failing on jasmine.stringContaining not working properly with wdio matchers
        xit('should use asymmetric matchers in toHaveAttribute', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', jasmine.stringContaining('docs'))
        })

        // TODO failing on jasmine.stringContaining not working properly with wdio matchers
        xit('should use asymmetric matchers in toHaveText', async () => {
            const heading = await $$('h1')[1]
            await expect(heading).toHaveText(jasmine.stringContaining('Open'))
        })
    })

    describe('Spy and mock validation', () => {
        it('should validate element interactions', async () => {
            const searchButton = await $('.DocSearch-Button')

            // Validate button exists and has expected properties
            await expect(searchButton).toExist()
            await expect(searchButton).toBeClickable()

            const buttonType = await searchButton.getAttribute('type')
            await expect(buttonType).toEqual(jasmine.any(String))
        })
    })

    describe('Array and collection validation', () => {
        // TODO asymmetric matchers are not working properly in this test
        xit('should validate collections with jasmine matchers', async () => {
            const navLinks = await $$('nav a')
            const count = navLinks.length

            // Standard Jasmine matchers
            await expect(count).toBeGreaterThan(0)
            await expect(count).toEqual(jasmine.any(Number))

            // WebdriverIO matcher with asymmetric matcher for attribute value
            const firstLink = navLinks[0]
            await expect(firstLink).toHaveAttribute('href', jasmine.any(String))
        })

        it('should validate array content with jasmine.arrayContaining', async () => {
            const navLinks = await $$('nav a')
            const texts: string[] = []
            const count = await navLinks.length
            for (let i = 0; i < Math.min(3, count); i++) {
                texts.push(await navLinks[i].getText())
            }

            await expect(texts).toEqual(jasmine.arrayContaining([jasmine.any(String)]))
        })
    })

    // failing on jasmine.stringContaining not working properly with wdio matchers
    describe('Browser state validation', () => {
        xit('should validate browser properties with asymmetric matchers', async () => {
            const title = await browser.getTitle()
            const url = await browser.getUrl()

            await expect(title).toEqual(jasmine.stringMatching(/WebdriverIO/i))
            await expect(url).toEqual(jasmine.stringContaining('webdriver.io'))

            // Combined with WebdriverIO matchers
            await expect(browser).toHaveUrl(jasmine.stringContaining('webdriver.io'))
            await expect(browser).toHaveTitle(jasmine.stringContaining('WebdriverIO'))
        })
    })

    describe('Element property validation', () => {
        it('should validate element properties with jasmine.objectContaining', async () => {
            const heading = await $$('h1')[1]
            const size = await heading.getSize()

            await expect(size).toEqual(jasmine.objectContaining({
                width: jasmine.any(Number),
                height: jasmine.any(Number)
            }))

            await expect(size.width).toBeGreaterThan(0)
            await expect(size.height).toBeGreaterThan(0)
        })

        // TODO failing with Error: Can't call getText on element with selector ".non-existent-element-xyz" because element wasn't found
        xit('should validate element attributes', async () => {
            const searchButton = await $('.DocSearch-Button')
            const classList = await searchButton.getAttribute('class')

            await expect(classList).toEqual(jasmine.stringContaining('DocSearch'))
            await expect(searchButton).toHaveElementClass(jasmine.stringContaining('DocSearch'))
        })
    })

    describe('Negation with asymmetric matchers', () => {
        it('should work with not and asymmetric matchers', async () => {
            const title = await browser.getTitle()

            await expect(title).not.toEqual(jasmine.stringContaining('Firefox'))
            await expect(title).not.toEqual(jasmine.stringMatching(/selenium/i))
        })

        // TODO to keep? Failing since element not found
        xit('should combine not with WebdriverIO matchers', async () => {
            const nonExistent = await $('.non-existent-element-xyz')

            await expect(nonExistent).not.toBeDisplayed()
            await expect(nonExistent).not.toHaveText(jasmine.any(String))
        })
    })

    describe('Expect.withContext usage', () => {
        xit('should provide additional context on failure', async () => {
            const title = await browser.getTitle()

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore -- withContext fails tsc, see https://github.com/webdriverio/expect-webdriverio/issues/1407
            await expect(title).withContext('Checking page title for webdriver.io').toBe('Non-Matching Title')
        })
    })
})
