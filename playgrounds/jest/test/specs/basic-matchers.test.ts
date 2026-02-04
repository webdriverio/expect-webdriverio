describe('Basic Expect Matchers', () => {
    beforeEach(async () => {
        console.log('Navigating to WebdriverIO homepage', standalone)
        await standalone.url('https://webdriver.io')
        await expect(standalone).toHaveTitle('WebdriverIO', { containing: true })
    })

    describe('Boolean matchers', () => {
        it('should verify truthy values', async () => {
            const element = await standalone.$('.navbar')
            const isDisplayed = await element.isDisplayed()
            console.log('expect', expect)
            expect(isDisplayed).toBe(true)
            expect(isDisplayed).toBeTruthy()
        })

        it('should verify falsy values', async () => {
            const element = await standalone.$('.non-existent-element')
            const exists = await element.isExisting()
            expect(exists).toBe(false)
            expect(exists).toBeFalsy()
        })
    })

    describe('Unique Jest matchers', () => {
        it('should verify the expect is the real Jest one', async () => {
            expect({Jest: true}).toMatchObject({Jest: true})
        })
    })

    describe('String matchers', () => {
        it('should match exact text', async () => {
            const title = await standalone.getTitle()
            expect(title).toContain('WebdriverIO')
        })

        it('should match with regex', async () => {
            const url = await standalone.getUrl()
            expect(url).toMatch(/^https:\/\/webdriver\.io/)
        })
    })

    describe('Number matchers', () => {
        it('should compare numbers', async () => {
            const navLinks = await standalone.$$('nav a')
            const count = navLinks.length

            expect(count).toBeGreaterThan(5)
            expect(count).toBeGreaterThanOrEqual(6)
            expect(count).toBeLessThan(100)
            expect(count).toBeLessThanOrEqual(50)
        })
    })

    describe('Array matchers', () => {
        it('should verify array contents', async () => {
            const navLinks = await standalone.$$('nav a')
            const hrefs: string[] = []
            for (const link of navLinks) {
                hrefs.push(await link.getAttribute('href'))
            }

            expect(hrefs).toBeInstanceOf(Array)
            expect(hrefs.length).toBeGreaterThan(0)
            expect(hrefs).toEqual(expect.arrayContaining(['/docs/gettingstarted']))
        })
    })

    describe('Object matchers', () => {
        it('should match object properties', async () => {
            const capabilities = await standalone.capabilities

            expect(capabilities).toHaveProperty('browserName')
            expect(capabilities).toMatchObject({
                browserName: 'chrome'
            })
        })
    })

    describe('Negation', () => {
        it('should work with not', async () => {
            const title = await standalone.getTitle()

            expect(title).not.toBe('')
            expect(title).not.toContain('Firefox')
        })
    })

    describe('Async/Promise matchers', () => {
        it('should handle promises', async () => {
            const url = standalone.getUrl()
            await expect(url).resolves.toMatch(/webdriver/)
        })

        it('should not reject', async () => {
            const title = standalone.getTitle()
            await expect(title).resolves.toBeDefined()
        })
    })
})
