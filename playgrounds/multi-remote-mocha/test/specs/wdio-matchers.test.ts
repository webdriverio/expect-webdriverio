import { multiRemoteBrowser } from '@wdio/globals'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Multi-Remote Browser Matchers', () => {

        describe('toHaveTitle Matcher', () => {
            it('should verify browser title', async () => {
                await expect(multiRemoteBrowser).toHaveTitle('WebdriverJS Testpage')
            })

            it('should verify browser title error messages contains mult-remote values', async () => {
                await multiRemoteBrowser.getInstance('firefox')!.url('about:blank')
                const assertion = expect(multiRemoteBrowser).toHaveTitle('WebdriverJS Testpage')
                await expect(assertion).rejects.toThrow(/Expect multi-remote<(?:chrome, firefox|firefox, chrome)> to have title/)
                await expect(assertion).rejects.toThrow(/"firefox": "WebdriverJS Testpage"/)
            })

            it('should verify browser title contains text', async () => {
                await expect(multiRemoteBrowser).toHaveTitle(expect.stringContaining('WebdriverJS'))
            })

            it('should verify browser title contains text for each browser by map', async () => {
                await expect(multiRemoteBrowser).toHaveTitle({
                    chrome: expect.stringContaining('WebdriverJS'),
                    firefox: expect.stringContaining('WebdriverJS')
                })
            })

            it('should verify browser title contains text for one browser with select', async () => {
                await expect(multiRemoteBrowser.select('firefox')).toHaveTitle({
                    firefox: expect.stringContaining('WebdriverJS')
                })
            })
        })

        describe('toHaveUrl Matcher', () => {

            it('should verify browser URL', async () => {
                await expect(multiRemoteBrowser).toHaveUrl('https://guinea-pig.webdriver.io/')
            })

            it('should verify URL contains path', async () => {
                await expect(multiRemoteBrowser).toHaveUrl(expect.stringContaining('guinea-pig.webdriver.io'))
            })

            it('should verify URL contains path for multi-remote values', async () => {
                await expect(multiRemoteBrowser).toHaveUrl({
                    chrome: expect.stringContaining('guinea-pig.webdriver.io'),
                    firefox: expect.stringContaining('guinea-pig.webdriver.io')
                })
            })

        })

        describe('toHaveLocalStorageItem Matcher', () => {
            it('should verify not localStorage item', async () => {
                await expect(multiRemoteBrowser).not.toHaveLocalStorageItem('key', 'value')
            })

            it('should verify not localStorage item with options', async () => {
                await expect(multiRemoteBrowser).not.toHaveLocalStorageItem('key', expect.anything(), { wait: 0 })
            })
        })

        describe('toHaveClipboardText Matcher', () => {
            it('should verify clipboard text', async () => {
                await expect(multiRemoteBrowser.select('chrome')).toHaveClipboardText('')
            })
        })

        describe('Per-browser expected values', () => {
            it('should verify a different title per browser with expect.multiRemote() or its plain object shorthand', async () => {
                await multiRemoteBrowser.getInstance('firefox')!.url('about:blank')

                await expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ firefox: '', chrome: 'WebdriverJS Testpage' }))
                await expect(multiRemoteBrowser).toHaveTitle({ firefox: '', chrome: 'WebdriverJS Testpage' })
            })

            it('should fail with the per-browser values in the error message', async () => {
                await multiRemoteBrowser.getInstance('firefox')!.url('about:blank')

                const assertion = expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ chrome: 'WebdriverJS Testpage', firefox: 'WebdriverJS Testpage' }))

                await expect(assertion).rejects.toThrow(/-   "firefox": "WebdriverJS Testpage",\n\+   "firefox": "",/)
            })

            it('should fail strictly, also with .not, when a browser is missing or unknown', async () => {
                await expect(expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({ chrome: 'WebdriverJS Testpage' })))
                    .rejects.toThrow(/to have title/)
                await expect(expect(multiRemoteBrowser).not.toHaveTitle(expect.multiRemote({ chrome: 'Other', firefox: 'Other', safari: 'Other' })))
                    .rejects.toThrow(/not to have title/)
                await expect(expect(multiRemoteBrowser).not.toHaveTitle({ Chrome: 'Other', Firefox: 'Other' }))
                    .rejects.toThrow(/not to have title/)
            })

            it('should apply the string options to expect.oneOf(), also nested per browser', async () => {
                await expect(multiRemoteBrowser).toHaveTitle(expect.oneOf('webdriverjs testpage', 'other'), { ignoreCase: true })
                await expect(multiRemoteBrowser).toHaveTitle(expect.multiRemote({
                    chrome: expect.oneOf('WEBDRIVERJS'),
                    firefox: expect.oneOf('testpage'),
                }), { ignoreCase: true, containing: true })
            })
        })
    })
})
