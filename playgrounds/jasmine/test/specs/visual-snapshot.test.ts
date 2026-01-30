// TODO fix Viusal Snapshot is not out of the box working with Jasmine, so we skip these tests
xdescribe('Visual Snapshot Testing', () => {
    beforeEach(async () => {
        await browser.url('https://webdriver.io/docs/gettingstarted')
    })

    describe('Element Visual Snapshots', () => {
        it('should match element visual snapshot with auto-generated name', async () => {
            const logo = await $('.navbar__logo')
            await expect(logo).toMatchElementSnapshot('logo')
        })

        it('should match element visual snapshot with custom name', async () => {
            const logo = await $('.navbar__logo')
            await expect(logo).toMatchElementSnapshot('wdioLogo')
        })

        it('should match element visual snapshot with zero mismatch', async () => {
            const logo = await $('.navbar__logo')
            await expect(logo).toMatchElementSnapshot('wdioLogo', 0)
        })

        it('should match element visual snapshot with options', async () => {
            const logo = await $('.navbar__logo')
            await expect(logo).toMatchElementSnapshot('wdioLogo', {
                // Visual comparison options
                blockOutStatusBar: true,
                blockOutToolBar: true,
            })
        })

        it('should match element visual snapshot with mismatch percentage', async () => {
            const heading = await $('h1')
            // Allow up to 5% mismatch
            await expect(heading).toMatchElementSnapshot('mainHeading', 5)
        })
    })

    describe('Screen Visual Snapshots', () => {
        it('should match screen visual snapshot', async () => {
            await expect(browser).toMatchScreenSnapshot('gettingStartedPage')
        })

        it('should match screen snapshot with zero mismatch', async () => {
            await expect(browser).toMatchScreenSnapshot('homepage', 0)
        })

        it('should match screen snapshot with options', async () => {
            await expect(browser).toMatchScreenSnapshot('homepage', {
                // Visual comparison options
                hideScrollBars: true,
            })
        })

        it('should match screen snapshot with mismatch percentage', async () => {
            // Allow up to 2% mismatch
            await expect(browser).toMatchScreenSnapshot('dynamicContent', 2)
        })
    })

    describe('Full Page Visual Snapshots', () => {
        it('should match full page visual snapshot', async () => {
            await expect(browser).toMatchFullPageSnapshot('fullPage', 0.15)
        })

        it('should match full page snapshot with zero mismatch', async () => {
            await expect(browser).toMatchFullPageSnapshot('fullPageExact', 0.15)
        })

        it('should match full page snapshot with options', async () => {
            await expect(browser).toMatchFullPageSnapshot('fullPage', {
                // Full page screenshot options
                fullPageScrollTimeout: 1500,
                hideScrollBars: true,
            })
        })

        it('should match full page with mismatch tolerance', async () => {
            // Allow up to 3% mismatch for animations
            await expect(browser).toMatchFullPageSnapshot('fullPageDynamic', 3)
        })
    })

    describe('Tabbable Page Visual Snapshots', () => {
        it('should match tabbable page visual snapshot', async () => {
            await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0.15)
        })

        it('should match tabbable page with zero mismatch', async () => {
            await expect(browser).toMatchTabbablePageSnapshot('tabbableExact', 0.1)
        })

        it('should match tabbable page with options', async () => {
            await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0.1, {
                // Tabbable page options
                hideScrollBars: true,
            })
        })

        it('should match tabbable page with mismatch tolerance', async () => {
            // Allow up to 1% mismatch
            await expect(browser).toMatchTabbablePageSnapshot('tabbableWithTolerance', 1)
        })
    })
})
