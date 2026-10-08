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
        // Wait for the `load` event: before it, the frame shows its first document, `about:blank`
        await page.execute(() => new Promise<void>((resolve) => {
            const iframe = document.createElement('iframe')
            iframe.addEventListener('load', () => resolve(), { once: true })
            iframe.src = './two.html'
            document.body.appendChild(iframe)
        }))
        const frame = await page.frame(page.$('iframe'))

        await expect(frame).toHaveTitle('two')
        await expect(frame).toHaveUrl('https://guinea-pig.webdriver.io/two.html')
    })
})
