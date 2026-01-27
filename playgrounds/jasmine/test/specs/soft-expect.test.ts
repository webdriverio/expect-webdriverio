import { browser, $, $$ } from '@wdio/globals'

// TODO fix non-working expect.soft in jasmine playground see https://github.com/webdriverio/expect-webdriverio/issues/1887
xdescribe('Soft Assertions with expect.soft', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io')
    })

    describe('Basic soft assertions', () => {
        it('should collect multiple failures before asserting', async () => {
            const heading = await $('h1')
            const searchButton = await $('.DocSearch-Button')

            // These assertions won't stop test execution immediately
            await expect.soft(heading).toHaveText(expect.stringContaining('Next-gen'))
            await expect.soft(searchButton).toBeDisplayed()
            await expect.soft(browser).toHaveUrl(expect.stringContaining('webdriver.io'))

            // All soft assertions are evaluated at the end
        })

        it('should continue execution even with failures', async () => {
            const nav = await $('nav')

            // This will fail but won't stop execution
            await expect.soft(nav).toHaveText('Wrong text')

            // This will still run
            await expect.soft(nav).toExist()
            await expect.soft(nav).toBeDisplayed()
        })
    })

    describe('Multiple element checks', () => {
        it('should validate multiple elements with soft assertions', async () => {
            const searchButton = await $('.DocSearch-Button')
            const nav = await $('nav')
            const heading = await $('h1')

            await expect.soft(searchButton).toExist()
            await expect.soft(searchButton).toBeClickable()
            await expect.soft(searchButton).toBeDisplayed()

            await expect.soft(nav).toExist()
            await expect.soft(nav).toBeDisplayed()

            await expect.soft(heading).toExist()
            await expect.soft(heading).toHaveText(expect.stringContaining('automation'))
        })
    })

    describe('Browser validations', () => {
        it('should validate browser state with soft assertions', async () => {
            await expect.soft(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
            await expect.soft(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))
            await expect.soft(browser).toHaveUrl('https://webdriver.io/')
            await expect.soft(browser).toHaveUrl(expect.stringContaining('webdriver'))
        })
    })

    describe('Array elements validation', () => {
        it('should validate multiple elements in array', async () => {
            const navLinks = await $$('nav a')

            await expect.soft(navLinks).toBeElementsArrayOfSize({ gte: 40 })
            await expect.soft(navLinks).toBeElementsArrayOfSize({ lte: 50 })

            // Check first 3 elements
            await expect.soft(navLinks[0]).toBeDisplayed()
            await expect.soft(navLinks[0]).toHaveAttribute('href', expect.any(String))
            await expect.soft(navLinks[1]).toBeDisplayed()
            await expect.soft(navLinks[1]).toHaveAttribute('href', expect.any(String))
            await expect.soft(navLinks[2]).toBeDisplayed()
            await expect.soft(navLinks[2]).toHaveAttribute('href', expect.any(String))
        })
    })

    describe('Mixed soft and hard assertions', () => {
        it('should allow mixing soft and hard assertions', async () => {
            const searchButton = await $('.DocSearch-Button')

            // Hard assertion - will fail immediately if not met
            await expect(searchButton).toExist()

            // Soft assertions - will collect failures
            await expect.soft(searchButton).toBeDisplayed()
            await expect.soft(searchButton).toBeClickable()
            await expect.soft(searchButton).toHaveElementClass('DocSearch-Button')

            // Another hard assertion
            await expect(browser).toHaveUrl('https://webdriver.io/')
        })
    })

    describe('Attribute validation', () => {
        it('should validate multiple attributes with soft expect', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')

            await expect.soft(docsLink).toHaveAttribute('href', '/docs/gettingstarted')
            await expect.soft(docsLink).toHaveAttribute('class', expect.stringContaining('navbar'))
            await expect.soft(docsLink).toHaveText('Docs')
        })
    })

    describe('Negated soft assertions', () => {
        it('should work with not', async () => {
            const nonExistent = await $('.non-existent-element-xyz')

            await expect.soft(nonExistent).not.toBeDisplayed()
            await expect.soft(nonExistent).not.toHaveText('anything')
            await expect.soft(nonExistent).not.toBeClickable()
        })
    })

    describe('Complex validation scenarios', () => {
        it('should validate complex page structure', async () => {
            // Validate navigation
            const nav = await $('nav')
            await expect.soft(nav).toExist()
            await expect.soft(nav).toBeDisplayed()

            // Validate multiple links
            const navLinks = await $$('nav a')
            await expect.soft(navLinks).toBeElementsArrayOfSize({ gte: 40 })

            // Validate search functionality
            const searchButton = await $('.DocSearch-Button')
            await expect.soft(searchButton).toBeClickable()
            await expect.soft(searchButton).toHaveElementProperty('type', 'button')

            // Validate heading
            const heading = await $('h1')
            await expect.soft(heading).toExist()
            await expect.soft(heading).toHaveText(expect.stringContaining('Next-gen'))

            // All assertions evaluated at end
        })
    })
})
