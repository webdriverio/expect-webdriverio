import { browser } from '@wdio/globals'

// WebdriverIO v10: in a BiDi session, `browser.url()` gives the top-level browsing context, and `frame()` a frame of it
describe('Browsing context (window and frame)', () => {
    let page: WebdriverIO.BrowsingContext

    beforeEach(async () => {
        page = await browser.url('https://guinea-pig.webdriver.io/')
    })

    it('asserts on a window', async () => {
        await expect(page).toHaveTitle('WebdriverJS Testpage')
        await expect(page).toHaveUrl('https://guinea-pig.webdriver.io/')
        await expect(page).not.toHaveLocalStorageItem('key-that-does-not-exist')
    })

    it('asserts on a frame: its own document, not the one of the window', async () => {
        await browser.execute(() => {
            const iframe = document.createElement('iframe')
            iframe.src = './two.html'
            document.body.appendChild(iframe)
        })
        const frame = await page.frame(page.$('iframe'))

        await expect(frame).toHaveUrl(expect.stringContaining('/two.html'))
        await expect(frame).not.toHaveTitle('WebdriverJS Testpage')
    })

    it('names the window and its URL in the failure message', async () => {
        await expect(expect(page).toHaveTitle('Other title', { wait: 0 })).rejects.toThrow("Expect chrome's window (https://guinea-pig.webdriver.io/) to have title")
    })
})
