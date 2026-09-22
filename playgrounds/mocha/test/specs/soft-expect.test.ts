import { browser, $, $$ } from '@wdio/globals'

describe('Soft Assertions with expect.soft', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Basic soft assertions', () => {
        it('should collect multiple failures before asserting', async () => {
            const heading = await $('h1')
            const button = await $('.btn1')

            // These assertions won't stop test execution immediately
            await expect.soft(heading).toHaveText(expect.stringContaining('WebdriverJS'))
            await expect.soft(button).toBeDisplayed()
            await expect.soft(browser).toHaveUrl(expect.stringContaining('webdriver.io'))

            // All soft assertions are evaluated at the end
        })

        it('should continue execution even with failures', async () => {
            const header = await $('header')

            // This will fail but won't stop execution
            await expect.soft(header).toHaveText('Wrong text')

            // This will still run
            await expect.soft(header).toExist()
            await expect.soft(header).toBeDisplayed()
        })
    })

    describe('Multiple element checks', () => {
        it('should validate multiple elements with soft assertions', async () => {
            const button = await $('.btn1')
            const header = await $('header')
            const heading = await $('h1')

            await expect.soft(button).toExist()
            await expect.soft(button).toBeClickable()
            await expect.soft(button).toBeDisplayed()

            await expect.soft(header).toExist()
            await expect.soft(header).toBeDisplayed()

            await expect.soft(heading).toExist()
            await expect.soft(heading).toHaveText(expect.stringContaining('Testpage'))
        })
    })

    describe('Browser validations', () => {
        it('should validate browser state with soft assertions', async () => {
            await expect.soft(browser).toHaveTitle('WebdriverJS Testpage')
            await expect.soft(browser).toHaveTitle(expect.stringContaining('WebdriverJS'))
            await expect.soft(browser).toHaveUrl('https://guinea-pig.webdriver.io/')
            await expect.soft(browser).toHaveUrl(expect.stringContaining('webdriver'))
        })
    })

    describe('Array elements validation', () => {
        it('should validate multiple elements in array', async () => {
            const links = await $$('a')

            await expect.soft(links).toBeElementsArrayOfSize({ gte: 5 })
            await expect.soft(links).toBeElementsArrayOfSize({ lte: 10 })

            // Check first 3 elements
            await expect.soft(links[0]).toBeDisplayed()
            await expect.soft(links[0]).toHaveAttribute('href', expect.any(String))
            await expect.soft(links[1]).toBeDisplayed()
            await expect.soft(links[1]).toHaveAttribute('href', expect.any(String))
            await expect.soft(links[2]).toBeDisplayed()
            await expect.soft(links[2]).toHaveAttribute('href', expect.any(String))
        })
    })

    describe('Mixed soft and hard assertions', () => {
        it('should allow mixing soft and hard assertions', async () => {
            const button = await $('.btn1')

            // Hard assertion - will fail immediately if not met
            await expect(button).toExist()

            // Soft assertions - will collect failures
            await expect.soft(button).toBeDisplayed()
            await expect.soft(button).toBeClickable()
            await expect.soft(button).toHaveElementClass('btn1')

            // Another hard assertion
            await expect(browser).toHaveUrl('https://guinea-pig.webdriver.io/')
        })
    })

    describe('Attribute validation', () => {
        it('should validate multiple attributes with soft expect', async () => {
            const secondPageLink = await $('#secondPageLink')

            await expect.soft(secondPageLink).toHaveAttribute('href', './two.html')
            await expect.soft(secondPageLink).toHaveAttribute('id', expect.stringContaining('secondPage'))
            await expect.soft(secondPageLink).toHaveText('two')
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
            // Validate header
            const header = await $('header')
            await expect.soft(header).toExist()
            await expect.soft(header).toBeDisplayed()

            // Validate multiple links
            const links = await $$('a')
            await expect.soft(links).toBeElementsArrayOfSize({ gte: 5 })

            // Validate button functionality
            const button = await $('.btn1')
            await expect.soft(button).toBeClickable()
            await expect.soft(button).toHaveElementProperty('type', 'submit')

            // Validate heading
            const heading = await $('h1')
            await expect.soft(heading).toExist()
            await expect.soft(heading).toHaveText(expect.stringContaining('WebdriverJS'))

            // All assertions evaluated at end
        })
    })
})
