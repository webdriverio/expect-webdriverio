import { browser, $, $$ } from '@wdio/globals'
import { setFeatureFlags } from 'expect-webdriverio'
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

        it('should verify not localStorage item', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', 'value')
        })

        it('should verify not localStorage item with options', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', expect.anything(), { wait: 0 })
            await expect(browser).not.toHaveLocalStorageItem('key', undefined, { wait: 0 })
            await expect(browser).not.toHaveLocalStorageItem('key', undefined)
        })
    })

    describe('Element existence matchers', () => {
        it('should verify element exists', async () => {
            const githubLink = $('#githubRepo')

            await expect(githubLink).toExist()
            await expect(await githubLink).toExist()
            await expect(await githubLink).toBeExisting()
        })

        it('should verify all elements are existing', async () => {
            const githubLink = $$('#githubRepo')

            await expect(githubLink).toExist()
            await expect(await githubLink).toExist()
            await expect(await githubLink).toBeExisting()
        })

        it('should verify element does not exist', async () => {
            const nonExistent = await $('.non-existent-element')

            await expect(nonExistent).not.toExist()
            await expect(await nonExistent).not.toExist()
        })

        it('should verify elements do not exist', async () => {
            const nonExistent = $$('.non-existent-elements')

            await expect(nonExistent).not.toExist()
            await expect(await nonExistent).not.toExist()
        })

    })

    describe('Element visibility matchers', () => {
        it('should verify element is displayed', async () => {
            const header = $('header')

            await expect(header).toBeDisplayed()
            await expect(await header).toBeDisplayed()
        })

        it('should verify element is displayed in viewport', async () => {
            const githubLink = await $('#githubRepo')

            await expect(githubLink).toBeDisplayedInViewport()
        })

        it('should verify elements are displayed', async () => {
            const header = $$('header')

            await expect(header).toBeDisplayed()
            await expect(await header).toBeDisplayed()
            await expect(await header.filter(n => n.isExisting())).toBeDisplayedInViewport()
        })

        it('should verify that some elements are displayed', async () => {
            const header = $$('header')

            await expect(some(header)).toBeDisplayed()
            await expect(some(await header)).toBeDisplayed()
            await expect(some(await header.filter(n => n.isExisting()))).toBeDisplayedInViewport()
        })

        it('should be able to query isDisplayed on element that never existed', async () => {
            await browser.url("about:blank")
            const h1 = $$('h1')

            await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/at least one result/)
        })

        // TODO waiting fix, see https://github.com/webdriverio/webdriverio/issues/15550
        it.skip('should be able to query isDisplayed on element no longer existing', async () => {
            await browser.url('https://guinea-pig.webdriver.io/')
            const h1 = $$('h1')
            await expect(h1).toBeDisplayed()

            await browser.url('about:blank')

            await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/at least one result/)
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

    describe('Legacy element text matchers', () => {
        it('should verify element text', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toBeDisplayed()
            await expect(secondPageLink).toHaveText('two')
        })

        it('should verify element text with expected array (deprecated) or oneOf', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveText(['two', 'Two'])
            await expect(secondPageLink).toHaveText(expect.oneOf('two', 'Two'))
        })

        it('should verify element contains text', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText(expect.stringContaining('Test CSS'))
        })

        it('should verify text with options', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
        })

        describe('Multiple Elements', () => {
            describe('Awaited', () => {
                it('should verify text with array of text & with options with awaited ChainablePromiseArray', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify text with array of text with oneOf', async () => {
                    const heading = await $$('h1')

                    await expect(heading).toHaveText(expect.oneOf('WebdriverJS Testpage', 'Test css'), { ignoreCase: true, containing: true })
                })

                it('should verify text with array of text without exact array match', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['Test CSS Attributes', 'WebdriverJS Testpage', 'no match'])
                })

                it('should fails verify a single text found in only one element', async () => {
                    const heading = await $$('h1')
                    await expect(expect(heading).toHaveText('Test CSS Attributes', { ignoreCase: true, containing: true, wait: 500 })).rejects.toThrow()
                })

                it('should verify text with options with awaited filtered ChainablePromiseArray', async () => {
                    const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))
                    expect(heading.length).toBe(1)
                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with awaited getElements ChainablePromiseArray', async () => {
                    const heading = await $$('h1').getElements()
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with filetered awaited getElements ChainablePromiseArray', async () => {
                    const heading = (await $$('h1').getElements()).filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                describe('Empty elemetns', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = await $$('h10')

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })
                })
            })

            describe('Non-awaited', () => {

                it('should verify text with options with non-awaited ChainablePromiseArray', async () => {
                    const heading = $$('h1')

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited filtered ChainablePromiseArray', async () => {
                    const heading = $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited getElements ChainablePromiseArray', async () => {
                    const heading = $$('h1').getElements()

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                describe('Empty elements', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = $$('h10')

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })
                })
            })
        })
    })

    describe('New STRICT element text matchers', () => {
        beforeEach(() => {
            setFeatureFlags({ useToHaveTextStrictMultiElementsCompareStrategy: true })
        })

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

        describe('Multiple Elements', () => {
            describe('Awaited', () => {
                it('should verify text with array of text & with options with awaited ChainablePromiseArray', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify some text with array of text', async () => {
                    const heading = await $$('h1')

                    await expect(some(heading)).toHaveText(['DoesNotMatch', 'Test CSS Attributes'])
                    await expect(some(heading)).toHaveText('Test CSS Attributes')
                    await expect(some(heading)).toHaveText('test css', { ignoreCase: true, containing: true })
                })

                it('should verify text with array of text without exact array match', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'])
                })

                it('should fails verify a single text found in only one element', async () => {
                    const heading = await $$('h1')
                    await expect(expect(heading).toHaveText('Test CSS Attributes', { ignoreCase: true, containing: true, wait: 500 })).rejects.toThrow()
                })

                it('should verify text with options with awaited filtered ChainablePromiseArray', async () => {
                    const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))
                    expect(heading.length).toBe(1)
                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with awaited getElements ChainablePromiseArray', async () => {
                    const heading = await $$('h1').getElements()

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with filetered awaited getElements ChainablePromiseArray', async () => {
                    const heading = (await $$('h1').getElements()).filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })


                describe('Empty elements & Array length mismatch', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = await $$('h10')

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is not enough expected values', async () => {
                        const heading = await $$('h1')

                        expect(heading.length).toBe(2)
                        await expect(heading[0]).toHaveText(['WebdriverJS Testpage'])
                        await expect(expect(heading).toHaveText(['WebdriverJS Testpage'])).rejects.toThrow()
                    })

                    it('should fails if there is too many expected values', async () => {
                        const heading = await $$('h1')

                        expect(heading.length).toBe(2)
                        await expect(heading[0]).toHaveText(['WebdriverJS Testpage'])
                        await expect(heading[1]).toHaveText(['Test CSS Attributes'])
                        await expect(expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes', 'tooMuchValue!'])).rejects.toThrow()
                    })
                })
            })

            describe('Non-awaited', () => {

                it('should verify text with options with non-awaited ChainablePromiseArray', async () => {
                    const heading = $$('h1')

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited filtered ChainablePromiseArray', async () => {
                    const heading = $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited getElements ChainablePromiseArray', async () => {
                    const heading = $$('h1').getElements()

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                describe('Empty elements', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = $$('h10')

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })
                })
            })
        })
    })

    describe('Element attribute matchers', () => {
        it('should verify element exists', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href')
        })

        it('should verify element exists immediately', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', expect.anything(), { wait: 0 })
        })

        it('should verify element has attribute', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', './two.html')
        })

        it('should verify element does not exist', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).not.toHaveAttribute('non-existent-attribute')
        })

        it('should verify element does not exist immediately', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).not.toHaveAttribute('non-existent-attribute', expect.anything(), { wait: 0 })
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
        it('should verify element property value', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', 'submit')
        })

        it('should verify element property value with asymmetric matcher', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', expect.stringContaining('submit'))
        })

        it('should verify that element property exists', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type')
        })

        it('should verify that element property exists immediately', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', expect.anything(), { wait: 0 })
        })

        it('should verify that element property does not exist', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('doesNNotExist')
        })

        it('should verify that element property does not exist immediately', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('doesNNotExist', expect.anything(), { wait: 0 })
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

        it('should works with non-awaited elements', async () => {
            await expect($$('a')).toBeElementsArrayOfSize({ gte: 5 })
            await expect($$('a')).toBeElementsArrayOfSize({ lte: 10 })
        })

        it('should works with filtered elements', async () => {
            await expect($$('a').filter(el => el.isDisplayed())).toBeElementsArrayOfSize({ gte: 1 })
        })

    })

    describe('HTML matchers', () => {
        it('should verify element has specific HTML', async () => {
            const element = await $('h1')
            await expect(element).toHaveHTML('<h1>WebdriverJS Testpage</h1>', {
                includeSelectorTag: true,
                prettify: true,
                pierceShadowRoot: true,
                removeCommentNodes: true,
                excludeElements: ['.ignore-this']
            })
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
