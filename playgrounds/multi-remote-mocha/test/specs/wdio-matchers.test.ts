import { multiRemoteBrowser  } from '@wdio/globals'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await multiRemoteBrowser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Multi-Remote Browser Matchers', () => {
        it('should verify browser title', async () => {
            await expect(multiRemoteBrowser).toHaveTitle('WebdriverJS Testpage')
        })

        it('should verify browser title contains text', async () => {
            await expect(multiRemoteBrowser).toHaveTitle(expect.stringContaining('WebdriverJS'))
        })

        it('should verify browser title contains text for each browser by array', async () => {
            await expect(multiRemoteBrowser).toHaveTitle([
                expect.stringContaining('WebdriverJS'),
                expect.stringContaining('WebdriverJS')
            ])
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

        it('should verify not localStorage item', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', 'value')
        })

        it('should verify not localStorage item with options', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', expect.anything(), { wait: 0 })
            await expect(browser).not.toHaveLocalStorageItem('key', undefined, { wait: 0 })
            await expect(browser).not.toHaveLocalStorageItem('key', undefined)
        })
    })

    describe('Multi-Remote Elements Matchers', () => {
        describe('toBe Matchers', () => {
            it('should verify element is displayed', async () => {
                const h1 = multiRemoteBrowser.$('h1')

                await expect(h1).toBeDisplayed()
                await expect(await h1).toBeDisplayed()
            })

            it('should verify elements are displayed', async () => {
                const h1 = multiRemoteBrowser.$$('h1')

                await expect(h1).toBeDisplayed()
                await expect(await h1).toBeDisplayed()
            })
        })

        describe('toHave Matchers', () => {

            describe('Single element', () => {
                it('should verify element have text with one expect value', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toHaveText('WebdriverJS Testpage')
                    await expect(await h1).toHaveText('WebdriverJS Testpage')
                })

                it('should verify element have text with multiple expect values', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toHaveText(['WebdriverJS Testpage', 'WebdriverJS Testpage'])
                })

                it('should verify element have text with multi-remote expect values', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toHaveText({
                        'firefox': 'WebdriverJS Testpage',
                        'chrome': 'WebdriverJS Testpage'
                    })
                })
            })

            describe('Multiple elements', () => {
                it('should verify elements have texts', async () => {
                    const h1 = multiRemoteBrowser.$$('h1')

                    await expect(h1).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'])
                })

                it('should verify elements have texts with multi-remote values', async () => {
                    const h1 = multiRemoteBrowser.$$('h1')

                    await expect(h1).toHaveText({
                        'firefox': ['WebdriverJS Testpage', 'Test CSS Attributes'],
                        'chrome': ['WebdriverJS Testpage', 'Test CSS Attributes']
                    })
                })
              })
        })
    })
})
