describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await standalone.url('https://webdriver.io')
    })

    describe('Browser matchers', () => {
        it('should verify browser title', async () => {
            await expect(standalone).toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
        })

        it('should verify browser title contains text', async () => {
            await expect(standalone).toHaveTitle(expect.stringContaining('WebdriverIO'))
        })

        it('should verify browser URL', async () => {
            await expect(standalone).toHaveUrl('https://webdriver.io/')
        })

        it('should verify URL contains path', async () => {
            await expect(standalone).toHaveUrl(expect.stringContaining('webdriver.io'))
        })
    })

    describe('Element existence matchers', () => {
        it('should verify element exists', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toExist()
            await expect(searchButton).toBeExisting()
        })

        it('should verify element does not exist', async () => {
            const nonExistent = await standalone.$('.non-existent-element')
            await expect(nonExistent).not.toExist()
        })
    })

    describe('Element visibility matchers', () => {
        it('should verify element is displayed', async () => {
            const nav = await standalone.$('nav')
            await expect(nav).toBeDisplayed()
        })

        it('should verify element is displayed in viewport', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toBeDisplayedInViewport()
        })
    })

    describe('Element state matchers', () => {
        it('should verify element is clickable', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toBeClickable()
        })

        it('should verify element is enabled', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toBeEnabled()
        })

        it('should verify button is not disabled', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).not.toBeDisabled()
        })
    })

    describe('Element text matchers', () => {
        it('should verify element text', async () => {
            const docsLink = await standalone.$('=Docs')
            await expect(docsLink).toBeDisplayed()
            await expect(docsLink).toHaveText('Docs')
        })

        it('should verify element contains text', async () => {
            const heading = await standalone.$$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText(expect.stringContaining('Open Source'))
        })

        it('should verify text with options', async () => {
            const heading = await standalone.$$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText('OPEN SOURCE', { ignoreCase: true, containing: true })
        })
    })

    describe('Element attribute matchers', () => {
        it('should verify element has attribute', async () => {
            const docsLink = await standalone.$('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', '/docs/gettingstarted')
        })

        it('should verify attribute contains value', async () => {
            const docsLink = await standalone.$('a[href="/docs/gettingstarted"]')
            await expect(docsLink).toHaveAttribute('href', expect.stringContaining('docs'))
        })

        it('should verify element has class', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toHaveElementClass('DocSearch-Button')
        })

        it('should verify element has multiple classes', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toHaveElementClass(expect.stringContaining('DocSearch'))
        })
    })

    describe('Element property matchers', () => {
        it('should verify element property', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await expect(searchButton).toHaveElementProperty('type', 'button')
        })
    })

    describe('Element value matchers', () => {
        it('should verify input value', async () => {
            // Navigate to a page with inputs
            await standalone.url('https://the-internet.herokuapp.com/login')
            const username = await standalone.$('#username')
            await username.setValue('testuser')
            await expect(username).toHaveValue('testuser')
        })

        it('should verify value contains text', async () => {
            await standalone.url('https://the-internet.herokuapp.com/login')
            const username = await standalone.$('#username')
            await username.setValue('testuser123')
            await expect(username).toHaveValue(expect.stringContaining('testuser'))
        })
    })

    describe('Elements array matchers', () => {
        it('should verify elements array size', async () => {
            const navLinks = await standalone.$$('nav a')
            await expect(navLinks).toBeElementsArrayOfSize(49)
        })

        it('should verify elements array size with comparison', async () => {
            const navLinks = await standalone.$$('nav a')
            await expect(navLinks).toBeElementsArrayOfSize({ gte: 40 })
            await expect(navLinks).toBeElementsArrayOfSize({ lte: 50 })
        })
    })

    describe('Focus matchers', () => {
        it('should verify element is focused', async () => {
            const searchButton = await standalone.$('.DocSearch-Button')
            await searchButton.click()

            // The search modal input should be focused after clicking
            await standalone.pause(500) // Wait for modal to open
            const searchInput = await standalone.$('.DocSearch-Input')
            if (await searchInput.isExisting()) {
                await expect(searchInput).toBeFocused()
            }
        })
    })

    describe('With wait options', () => {
        it('should wait for condition to be met', async () => {
            const heading = await standalone.$('h1')
            await expect(heading).toBeDisplayed({ wait: 5000 })
        })

        it('should use custom interval', async () => {
            const nav = await standalone.$('nav')
            await expect(nav).toExist({ wait: 3000, interval: 100 })
        })
    })

    describe('Negated matchers', () => {
        it('should work with not', async () => {
            const nonExistent = await standalone.$('.non-existent-element-xyz')
            await expect(nonExistent).not.toBeDisplayed()
            await expect(nonExistent).not.toExist()
        })
    })
})
