import { browser, $, $$ } from '@wdio/globals'
import { expect } from 'expect-webdriverio'
import { some } from 'expect-webdriverio/api'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Browser matchers', () => {
        it('should verify browser title', async () => {
            await expect(browser).toHaveTitle(/WebdriverJS.*/)
        })

        it('should verify browser title contains text', async () => {
            await expect(browser).toHaveTitle(expect.stringContaining('WebdriverJS'))
        })

        it('should verify browser URL', async () => {
            await expect(browser).toHaveUrl('https://guinea-pig.webdriver.io/')
        })

        it('should verify URL contains path', async () => {
            await expect(browser).toHaveUrl(expect.stringContaining('webdriver.io'))
        })
    })

    describe('Element existence matchers', () => {
        it('should verify element exists', async () => {
            const githubLink = await $('#githubRepo')
            await expect(githubLink).toExist()
            await expect(githubLink).toBeExisting()
        })

        it('should verify element does not exist', async () => {
            const nonExistent = await $('.non-existent-element')
            await expect(nonExistent).not.toExist()
        })
    })

    describe('Element visibility matchers', () => {
        it('should verify element is displayed', async () => {
            const header = await $('header')
            await expect(header).toBeDisplayed()
        })

        it('should verify that some elements are displayed', async () => {
            const header = $$('header')

            await expect(some(header)).toBeDisplayed()
            await expect(some(await header)).toBeDisplayed()
            await expect(some(await header.filter(n => n.isExisting()))).toBeDisplayedInViewport()
        })

        it('should verify element is displayed in viewport', async () => {
            const githubLink = await $('#githubRepo')
            await expect(githubLink).toBeDisplayedInViewport()
        })
    })

    describe('Element state matchers', () => {
        it('should verify element is clickable', async () => {
            const button = await $('.btn1')
            await expect(button).toBeClickable()
        })

        it('should verify element is enabled', async () => {
            const button = await $('.btn1')
            await expect(button).toBeEnabled()
        })

        it('should verify button is not disabled', async () => {
            const button = await $('.btn1')
            await expect(button).not.toBeDisabled()
        })
    })

    describe('Element text matchers', () => {
        const newStrictStrategy = { featureFlags: { useToHaveTextStrictMultiElementsCompareStrategy: true } }

        it('should verify element text', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toBeDisplayed()
            await expect(secondPageLink).toHaveText('two')
        })

        it('should verify element contains text', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText(expect.stringContaining('Test CSS'))
        })

        it('should verify text with options', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
        })

        it("should verify multiple elements's texts with options", async () => {
            const headings = await $$('h1')

            await expect(headings).toHaveText(expect.oneOf('WebdriverJS Testpage', 'TEST CSS ATTRIBUTES'), { ignoreCase: true, containing: true, ...newStrictStrategy.featureFlags})
        })

        it("should verify multiple elements's texts exactly", async () => {
            const headings = await $$('h1')

            await expect(headings).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'], newStrictStrategy)
        })

        it("should verify some elements with oneOf", async () => {
            const headings = await $$('h1')

            await expect(some(headings)).toHaveText(expect.oneOf('Test CSS Attributes'), newStrictStrategy)
        })

        it('should verify element text with expected array', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveText('two')
            await expect(secondPageLink).toHaveText(['two', 'Two'])
            // TODO to support one day expect.oneOf!
            //await expect(secondPageLink).toHaveText(jasmine.oneOf('two', 'Two'))
            await expect(secondPageLink).toHaveText(expect.oneOf('two', 'Two'))
        })
    })

    describe('Element attribute matchers', () => {
        it('should verify element has attribute', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', './two.html')
        })

        it('should verify attribute contains value', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', expect.stringContaining('two'))
        })

        it('should verify element has class', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementClass('btn1')
        })

        it('should verify element has multiple classes', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementClass(expect.stringContaining('btn'))
        })
    })

    describe('Element property matchers', () => {
        it('should verify element property', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', 'submit')
            await expect(button).toHaveElementProperty('type')
        })

        it('should verify element property does not exists', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('non-existent', 'submit')
            await expect(button).not.toHaveElementProperty('non-existent')
        })

        it('should verify element property with anything', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', jasmine.anything(),  { wait : 0 })
            await expect(button).toHaveElementProperty('type', jasmine.anything(),  { wait : 0 })
        })

        it('should verify element property does not exists with wait option', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('non-existent', 'submit')
            await expect(button).not.toHaveElementProperty('non-existent', jasmine.anything(),  { wait : 0 })
        })
    })

    describe('Element value matchers', () => {
        it('should verify input value', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.setValue('testuser')
            await expect(searchInput).toHaveValue('testuser')
        })

        it('should verify value contains text', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.setValue('testuser123')
            await expect(searchInput).toHaveValue(expect.stringContaining('testuser'))
        })
    })

    describe('Elements array matchers', () => {
        it('should verify elements array size', async () => {
            const links = await $$('a')
            await expect(links).toBeElementsArrayOfSize(7)
        })

        it('should verify elements array size with comparison', async () => {
            const links = await $$('a')
            await expect(links).toBeElementsArrayOfSize({ gte: 5 })
            await expect(links).toBeElementsArrayOfSize({ lte: 10 })
        })
    })

    describe('Focus matchers', () => {
        it('should verify element is focused', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.click()

            await expect(searchInput).toBeFocused()
        })
    })

    describe('With wait options', () => {
        it('should wait for condition to be met', async () => {
            const heading = await $('h1')
            await expect(heading).toBeDisplayed({ wait: 5000 })
        })

        it('should use custom interval', async () => {
            const header = await $('header')
            await expect(header).toExist({ wait: 3000, interval: 100 })
        })
    })

    describe('Negated matchers', () => {
        it('should work with not', async () => {
            const nonExistent = await $('.non-existent-element-xyz')
            await expect(nonExistent).not.toBeDisplayed()
            await expect(nonExistent).not.toExist()
        })
    })
})
