import { multiRemoteBrowser } from '@wdio/globals'

// The baselines are not committed: the first test of a tag saves them, and the next tests compare with them
describe('Multi-remote Visual Snapshot Testing', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Screen Visual Snapshots', () => {
        it('should match the screen visual snapshot of every browser', async () => {
            await expect(multiRemoteBrowser).toMatchScreenSnapshot('homepage', 0)
        })

        it('should match the screen visual snapshot of every browser with options', async () => {
            await expect(multiRemoteBrowser).toMatchScreenSnapshot('homepage', {
                hideScrollBars: true,
            })
        })

        it('should match the screen visual snapshot of one browser', async () => {
            await expect(multiRemoteBrowser.getInstance('chrome')).toMatchScreenSnapshot('homepage', 0)
        })

        it('should fail for the browser that differs only', async () => {
            await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
                document.querySelector('#purplebox')!.remove()
            })

            await expect(expect(multiRemoteBrowser).toMatchScreenSnapshot('homepage', 0))
                .rejects.toThrow(/^Instance "firefox":\nExpected image mismatch percentage to be at most 0%/)
        })
    })

    describe('Full Page Visual Snapshots', () => {
        it('should match the full page visual snapshot of every browser', async () => {
            await expect(multiRemoteBrowser).toMatchFullPageSnapshot('fullPage', 0.3)
        })
    })

    describe('Tabbable Page Visual Snapshots', () => {
        it('should match the tabbable page visual snapshot of every browser', async () => {
            await expect(multiRemoteBrowser).toMatchTabbablePageSnapshot('tabbable', 0.3)
        })
    })

    // @wdio/visual-service 10.2.0 does not support multi-remote elements with WebdriverIO v10 (webdriverio/visual-testing#1238):
    // - a multi-remote element has no `parent`, so the matcher does not find the browser
    // - `addCommand()` on the multi-remote browser also adds the command to every instance, so the
    //   multi-remote `checkElement` replaces the one of each instance and runs the element of one browser on all
    describe.skip('Element Visual Snapshots', () => {
        it('should match the element visual snapshot of every browser', async () => {
            await expect(multiRemoteBrowser.$('#purplebox')).toMatchElementSnapshot('purplebox')
        })

        it('should match the element visual snapshot of one browser', async () => {
            await expect(multiRemoteBrowser.getInstance('chrome').$('#purplebox')).toMatchElementSnapshot('purplebox')
        })
    })
})
