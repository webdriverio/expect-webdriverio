import { browser } from '@wdio/globals'

// WebdriverIO v10: in a BiDi session, `browser.url()` gives the top-level browsing context, and `frame()` a frame of it
describe('Browsing context (tab, window, frame)', () => {
    const origin = 'https://guinea-pig.webdriver.io'
    let page: WebdriverIO.BrowsingContext

    /**
     * Adds a same-origin frame of `two.html` to the window, and gives its browsing context.
     * Waits for the `load` event: before it, the frame shows its first document, `about:blank`.
     */
    const addFrame = async () => {
        await page.execute(() => new Promise<void>((resolve) => {
            const iframe = document.createElement('iframe')
            iframe.addEventListener('load', () => resolve(), { once: true })
            iframe.src = './two.html'
            document.body.appendChild(iframe)
        }))
        return page.frame(page.$('iframe'))
    }

    beforeEach(async () => {
        page = await browser.url(`${origin}/`)
    })

    afterEach(async () => {
        await page.execute(() => localStorage.clear())
    })

    describe('window', () => {
        it('has the title and the URL of its document', async () => {
            await expect(page).toHaveTitle('WebdriverJS Testpage')
            await expect(page).toHaveUrl(`${origin}/`)
            await expect(page).not.toHaveTitle('two', { wait: 0 })
        })

        it('reads its local storage', async () => {
            await page.execute(() => localStorage.setItem('context-key', 'window value'))

            await expect(page).toHaveLocalStorageItem('context-key', 'window value')
            await expect(page).not.toHaveLocalStorageItem('key-that-does-not-exist')
        })

        it('reads the clipboard', async () => {
            await expect(page).toHaveClipboardText(expect.any(String))
        })
    })

    describe('frame', () => {
        it('has the title and the URL of its own document, not the ones of the window', async () => {
            const frame = await addFrame()

            await expect(frame).toHaveTitle('two')
            await expect(frame).toHaveUrl(`${origin}/two.html`)
            await expect(frame).not.toHaveTitle('WebdriverJS Testpage', { wait: 0 })
            await expect(page).toHaveTitle('WebdriverJS Testpage')
        })

        it('reads the local storage of its origin', async () => {
            const frame = await addFrame()
            await frame.execute(() => localStorage.setItem('context-key', 'frame value'))

            await expect(frame).toHaveLocalStorageItem('context-key', 'frame value')
        })

        it('finds its elements, and waits for an element that it adds later', async () => {
            const frame = await addFrame()
            await frame.execute(() => setTimeout(() => {
                const added = document.createElement('p')
                added.className = 'added-later'
                document.body.appendChild(added)
            }, 300))

            await expect(frame.$('h1')).toHaveText('WebdriverJS Testpage')
            await expect(frame.$$('.added-later')).toBeElementsArrayOfSize(1, { wait: 3000 })
        })
    })

    describe('second tab', () => {
        it('asserts on each tab, whatever the current context of the session', async () => {
            const tab = await browser.newWindow(`${origin}/two.html`)
            if (!('contextId' in tab)) {
                throw new Error('browser.newWindow() gives a browsing context only in a BiDi session')
            }

            try {
                await expect(tab).toHaveTitle('two')
                await expect(page).toHaveTitle('WebdriverJS Testpage')
            } finally {
                await tab.closeWindow()
                await page.activate()
            }
        })
    })

    describe('failure message', () => {
        it('names the window and its URL', async () => {
            await expect(expect(page).toHaveTitle('Other title', { wait: 0 })).rejects.toThrow(`Expect chrome's window (${origin}/) to have title`)
        })

        it('names the frame, and its URL when WebdriverIO knows it', async () => {
            const frame = await addFrame()

            // A frame found by its element has no URL yet: WebdriverIO sets it with `getUrl()` or `navigate()`
            await expect(expect(frame).toHaveTitle('Other title', { wait: 0 })).rejects.toThrow("Expect chrome's frame to have title")
            await frame.getUrl()
            await expect(expect(frame).toHaveTitle('Other title', { wait: 0 })).rejects.toThrow(`Expect chrome's frame (${origin}/two.html) to have title`)
        })

        it('does not repeat the URL for toHaveUrl, which shows it in the Received line', async () => {
            await expect(expect(page).toHaveUrl(`${origin}/other.html`, { wait: 0 })).rejects.toThrow("Expect chrome's window to have url")
        })
    })
})
