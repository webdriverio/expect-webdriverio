import { browser } from '@wdio/globals'

// WebdriverIO v10, BiDi session: the hybrid Jasmine `expect` with a browsing context
describe('Browsing context (window and frame)', () => {
    let page: WebdriverIO.BrowsingContext

    beforeEach(async () => {
        page = await browser.url('https://guinea-pig.webdriver.io/')
    })

    it('asserts on the window', async () => {
        await expect(page).toHaveTitle('WebdriverJS Testpage')
        await expect(page).toHaveUrl('https://guinea-pig.webdriver.io/')
    })

    it('asserts on a frame, with its own document', async () => {
        await page.execute(() => {
            const iframe = document.createElement('iframe')
            iframe.src = './two.html'
            document.body.appendChild(iframe)
        })
        const frame = await page.frame(page.$('iframe'))

        await expect(frame).toHaveTitle('two')
        await expect(frame).toHaveUrl('https://guinea-pig.webdriver.io/two.html')
    })
})
