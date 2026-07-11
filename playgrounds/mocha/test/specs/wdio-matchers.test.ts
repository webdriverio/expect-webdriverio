import { browser, $, $$ } from '@wdio/globals'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io')
    })

    describe('Browser matchers', () => {
        it('should verify browser title', async () => {
            await expect(browser).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
        })

        it('should verify browser title contains text', async () => {
            await expect(browser).toHaveTitle(expect.stringContaining('WebdriverIO'))
        })

        it('should verify browser URL', async () => {
            await expect(browser).toHaveUrl('https://webdriver.io/')
        })

        it('should verify URL contains path', async () => {
            await expect(browser).toHaveUrl(expect.stringContaining('webdriver.io'))
        })
    })

    describe('Element existence matchers', () => {
        it('should verify element exists', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toExist()
            await expect(searchButton).toBeExisting()
        })

        it('should verify element does not exist', async () => {
            const nonExistent = await $('.non-existent-element')
            await expect(nonExistent).not.toExist()
        })
    })

    describe('Element visibility matchers', () => {
        it('should verify element is displayed', async () => {
            const nav = await $('nav')
            await expect(nav).toBeDisplayed()
        })

        it('should verify element is displayed in viewport', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toBeDisplayedInViewport()
        })
    })

    describe('Element state matchers', () => {
        it('should verify element is clickable', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toBeClickable()
        })

        it('should verify element is enabled', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toBeEnabled()
        })

        it('should verify button is not disabled', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).not.toBeDisabled()
        })
    })

    describe('Element text matchers', () => {
        it('should verify element text', async () => {
            const docsLink = await $('=Docs')
            await expect(docsLink).toBeDisplayed()
            await expect(docsLink).toHaveText('Docs')
        })

        it('should verify element contains text', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText(expect.stringContaining('Open Source'))
        })

        it('should verify text with options', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
        })

        describe('Multiple Elements', () => {
            describe('Awaited', () => {
                it('should verify text with array of text & with options with awaited ChainablePromiseArray', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['','Open source'], { ignoreCase: true, containing: true })
                })

                it('should verify text with array of text without exact array match', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['Open Source and Open Governed', '', 'no match'])
                })

                it('should fails verify a single text found in only one element', async () => {
                    const heading = await $$('h1')
                    await expect(expect(heading).toHaveText('Open Source and Open Governed', { ignoreCase: true, containing: true, wait: 500 })).rejects.toThrow()
                })

                it('should verify text with options with awaited filtered ChainablePromiseArray', async () => {
                    const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('Open Source'))
                    expect(heading.length).toBe(1)
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })

                // TODO fix: When element array is 0 is does match anything and should fail, but it does not
                it.skip('should fails if there is no elements', async () => {
                    const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('test'))
                    expect(heading.length).toBe(0)
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with awaited getElements ChainablePromiseArray', async () => {
                    const heading = await $$('h1').getElements()
                    await expect(heading).toHaveText(['','Open Source and Open Governed'], { ignoreCase: true, containing: true })
                })

                // TODO fix `el.getText is not a function`
                it.skip('should verify text with options with filetered awaited getElements ChainablePromiseArray', async () => {
                    const heading = (await $$('h1').getElements()).filter(async (el) => (await el.getText()).includes('Open Source'))

                    // @ts-expect-error TODO support Element[] in toHaveText signature??
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })
            })

            describe('Non-awaited', () => {

                // TODO fix `Can't call "getText" on element with selector "h1", it is not a function`
                it.skip('should verify text with options with non-awaited ChainablePromiseArray', async () => {
                    const heading = $$('h1')
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })

                // TODO fix `Can't call "getText" on element with selector "h1", it is not a function`
                it.skip('should verify text with options with non-awaited filtered ChainablePromiseArray', async () => {
                    const heading = $$('h1').filter(async (el) => (await el.getText()).includes('Open Source'))

                    console.log('heading', heading)
                    // @ts-expect-error TODO support Element[] in toHaveText signature??
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })

                // TODO fix `el.getText is not a function`
                it.skip('should verify text with options with non-awaited getElements ChainablePromiseArray', async () => {
                    const heading = $$('h1').getElements()

                    // @ts-expect-error TODO support Element[] in toHaveText signature??
                    await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
                })
            })
        })
    })

    describe('Element attribute matchers', () => {
        it('should verify element exists', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href')
        })

        it('should verify element exists immediately', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', { wait: 0 })
        })

        it('should verify element has attribute', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', '/docs/gettingstarted')
        })

        it('should verify element does not exist', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).not.toHaveAttribute('non-existent-attribute')
        })

        it('should verify element does not exist immediately', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).not.toHaveAttribute('non-existent-attribute', { wait: 0 })
        })

        it('should verify attribute contains value', async () => {
            const docsLink = await $('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', expect.stringContaining('docs'))
        })

        it('should verify element has class', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementClass('DocSearch-Button')
        })

        it('should verify element has multiple classes', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementClass(expect.stringContaining('DocSearch'))
        })
    })

    describe('Element property matchers', () => {
        it('should verify element property value', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementProperty('type', 'button')
        })

        it('should verify element property value with asymmetric matcher', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementProperty('type', expect.stringContaining('button'))
        })

        it('should verify that element property exists', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementProperty('type')
        })

        it('should verify that element property exists immediately', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).toHaveElementProperty('type', { wait: 0 })
        })

        it('should verify that element property does not exist', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).not.toHaveElementProperty('doesNNotExist')
        })

        it('should verify that element property does not exist immediately', async () => {
            const searchButton = await $('.DocSearch-Button')
            await expect(searchButton).not.toHaveElementProperty('doesNNotExist', { wait: 0 })
        })
    })

    describe('Element value matchers', () => {
        it('should verify input value', async () => {
            // Navigate to a page with inputs
            await browser.url('https://the-internet.herokuapp.com/login')
            const username = await $('#username')
            await username.setValue('testuser')
            await expect(username).toHaveValue('testuser')
        })

        it('should verify value contains text', async () => {
            await browser.url('https://the-internet.herokuapp.com/login')
            const username = await $('#username')
            await username.setValue('testuser123')
            await expect(username).toHaveValue(expect.stringContaining('testuser'))
        })
    })

    describe('Elements array matchers', () => {
        it('should verify elements array size', async () => {
            const navLinks = await $$('nav a')
            await expect(navLinks).toBeElementsArrayOfSize(49)
        })

        it('should verify elements array size with comparison', async () => {
            const navLinks = await $$('nav a')
            await expect(navLinks).toBeElementsArrayOfSize({ gte: 40 })
            await expect(navLinks).toBeElementsArrayOfSize({ lte: 50 })
        })
    })

    describe('Focus matchers', () => {
        it('should verify element is focused', async () => {
            const searchButton = await $('.DocSearch-Button')
            await searchButton.click()

            // The search modal input should be focused after clicking
            await browser.pause(500) // Wait for modal to open
            const searchInput = await $('.DocSearch-Input')
            if (await searchInput.isExisting()) {
                await expect(searchInput).toBeFocused()
            }
        })
    })

    describe('With wait options', () => {
        it('should wait for condition to be met', async () => {
            const heading = await $('h1')
            await expect(heading).toBeDisplayed({ wait: 5000 })
        })

        it('should use custom interval', async () => {
            const nav = await $('nav')
            await expect(nav).toExist({ wait: 3000, interval: 100 })
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
