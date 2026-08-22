import { multiRemoteBrowser  } from '@wdio/globals'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Browser matchers', () => {
        it('should verify browser title', async () => {
            await expect(multiRemoteBrowser).toHaveTitle('WebdriverJS Testpage')
        })

        it('should verify browser title contains text', async () => {
            await expect(multiRemoteBrowser).toHaveTitle(expect.stringContaining('WebdriverJS'))
        })

        it('should verify browser title contains text for each browser by array', async () => {
            await expect(multiRemoteBrowser).toHaveTitle([expect.stringContaining('WebdriverJS'), expect.stringContaining('WebdriverJS')])
        })

        it('should verify browser title contains text for each browser by map', async () => {
            await expect(multiRemoteBrowser).toHaveTitle({
                chrome: expect.stringContaining('WebdriverJS'),
                firefox: expect.stringContaining('WebdriverJS')
            })
        })

        it('should verify browser title contains text for one browser', async () => {
            await expect(multiRemoteBrowser).toHaveTitle({
                firefox: expect.stringContaining('WebdriverJS')
            })
        })


        // it('should verify browser URL', async () => {
        //     await expect(multiRemoteBrowser).toHaveUrl('https://webdriver.io/')
        // })

        // it('should verify URL contains path', async () => {
        //     await expect(multiRemoteBrowser).toHaveUrl(expect.stringContaining('webdriver.io'))
        // })
    })
})
