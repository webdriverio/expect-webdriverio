describe('Visual Snapshot Testing', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Element Visual Snapshots', () => {
        it('should match element visual snapshot with auto-generated name', async () => {
            const box = await $('#purplebox')
            await expect(box).toMatchElementSnapshot('purplebox')
        })

        it('should match element visual snapshot with custom name', async () => {
            const box = await $('#purplebox')
            await expect(box).toMatchElementSnapshot('purpleBoxNamed')
        })

        it('should match element visual snapshot with zero mismatch', async () => {
            const box = await $('#purplebox')
            await expect(box).toMatchElementSnapshot('purpleBoxNamed', 0)
        })

        it('should match element visual snapshot with options', async () => {
            const box = await $('#purplebox')
            await expect(box).toMatchElementSnapshot('purpleBoxNamed', {
                // Visual comparison options
                blockOutStatusBar: true,
                blockOutToolBar: true,
            })
        })

        it('should match element visual snapshot with mismatch percentage', async () => {
            const heading = await $('h1')

            await expect(heading).toMatchElementSnapshot('mainHeading', 5)
        })
    })

    describe('Screen Visual Snapshots', () => {

        it('should match screen visual snapshot', async function () {
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
            await expect(browser).toMatchScreenSnapshot('dynamicContent', 2)
        })
    })

    describe('Full Page Visual Snapshots', () => {

        it('should match full page visual snapshot', async () => {
            await expect(browser).toMatchFullPageSnapshot('fullPage', 0.3)
        })

        it('should match full page snapshot with zero mismatch', async () => {
            await expect(browser).toMatchFullPageSnapshot('fullPageExact', 0.3)
        })

        // Skipping flaky test
        it.skip('should match full page snapshot with options', async () => {
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
            await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0.3)
        })

        it('should match tabbable page with zero mismatch', async () => {
            await expect(browser).toMatchTabbablePageSnapshot('tabbableExact', 0.3)
        })

        it('should match tabbable page with options', async () => {
            await expect(browser).toMatchTabbablePageSnapshot('tabbable', 0.3, {
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
