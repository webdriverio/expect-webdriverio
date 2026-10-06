import { multiRemoteBrowser } from '@wdio/globals'

// The baselines are not committed: the first test of a tag saves them, and the next tests compare with them
describe('Multi-remote Visual Snapshot Testing', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
        // The page changes 2 seconds after it loads (`.lateElem`, `#selectbox`...): take every screenshot after that
        await multiRemoteBrowser.$('.lateElem').waitForExist()
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

    describe('Element Visual Snapshots', () => {
        it('should match the element visual snapshot of every browser', async () => {
            await expect(multiRemoteBrowser.$('#purplebox')).toMatchElementSnapshot('purplebox', 0)
        })

        it('should match the element visual snapshot of every browser with a mismatch percentage', async () => {
            await expect(multiRemoteBrowser.$('header h1')).toMatchElementSnapshot('mainHeading', 5)
        })

        it('should match the element visual snapshot of one browser', async () => {
            await expect(multiRemoteBrowser.getInstance('chrome').$('#purplebox')).toMatchElementSnapshot('purplebox', 0)
        })

        it('should fail for the element of the browser that differs only', async () => {
            await multiRemoteBrowser.getInstance('firefox')!.execute(() => {
                document.querySelector<HTMLElement>('#purplebox')!.style.backgroundColor = 'orange'
            })

            await expect(expect(multiRemoteBrowser.$('#purplebox')).toMatchElementSnapshot('purplebox', 0))
                .rejects.toThrow(/^Instance "firefox":\nExpected image mismatch percentage to be at most 0%/)
        })
    })
})
