import { multiRemoteBrowser  } from '@wdio/globals'

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
                await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                const assertion = expect(multiRemoteBrowser).toHaveTitle('WebdriverJS Testpage')
                await expect(assertion).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)> to have title/)
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

            it('should verify browser title contains text for one browser with unstable_select', async () => {
                await expect(multiRemoteBrowser.unstable_select('firefox')).toHaveTitle({
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
                await expect(multiRemoteBrowser.unstable_select('chrome')).toHaveClipboardText('')
            })
        })
    })

    describe('Multi-Remote Elements Matchers', () => {
        describe('toBe Matchers', () => {
            describe('$', () => {
                it('should verify element is displayed', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toBeDisplayed()
                    await expect(await h1).toBeDisplayed()
                })

                it('should verify element is displayed for specific browser', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1.unstable_select('firefox')).toBeDisplayed()
                })

                it('should verify element exists', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toExist()
                    await expect(await h1).toExist()
                })

                it('should verify element exists for specific browser', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1.unstable_select('firefox')).toExist()
                })

                it('should verify element does not exists', async () => {
                    const nonExistingElement = multiRemoteBrowser.$('non-existing-element')

                    await expect(nonExistingElement).not.toExist()
                    await expect(await nonExistingElement).not.toExist()
                })

                it('should verify element does not exist for specific browser', async () => {
                    const nonExistingElement = multiRemoteBrowser.$('non-existing-element')

                    await expect(nonExistingElement.unstable_select('firefox')).not.toExist()
                })

                it('should be able to query isDisplayed on element never existed', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).not.toBeDisplayed()
                })

                it('should be able to query isDisplayed on element never existed for a specific browser', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1.unstable_select('firefox')).not.toBeDisplayed()
                    await expect(h1.unstable_select('chrome')).toBeDisplayed()
                })

                it('should be able to query isDisplayed on element no longer existing', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    // Crash here with `WebDriver Bidi command "script.callFunction" failed with error: no such node`
                    console.log('isDisplayed:', await h1.isDisplayed())
                    await expect(h1).not.toBeDisplayed()
                    await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\(`h1`\) to be displayed/)
                })

                it('should be able to query isDisplayed on element no longer existing and one still existing', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                    await expect(h1.unstable_select('firefox')).not.toBeDisplayed()
                    await expect(h1.unstable_select('chrome')).toBeDisplayed()
                    await expect(expect(h1).not.toBeDisplayed()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\(`h1`\) not to be displayed/)
                    await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\(`h1`\) to be displayed/)
                })
            })

            describe('$$', () => {
                it('should verify elements are displayed', async () => {
                    const h1 = multiRemoteBrowser.$$('h1')

                    await expect(h1).toBeDisplayed()
                    await expect(await h1).toBeDisplayed()
                })

                it('should verify elements are displayed for selected remote', async () => {
                    // TODO one day we should have select on MultiRemoteElement[]
                    const h1 = multiRemoteBrowser.unstable_select('firefox').$$('h1')

                    await expect(h1).toBeDisplayed()
                })

                it('should verify elements are existing', async () => {
                    const h1 = multiRemoteBrowser.$$('h1')

                    await expect(h1).toBeExisting()
                    await expect(await h1).toBeExisting()
                })

                it('should verify elements are existing for selected remote', async () => {
                    // TODO one day we should have select on MultiRemoteElement[]
                    const h1 = multiRemoteBrowser.unstable_select('firefox').$$('h1')

                    await expect(h1).toBeExisting()
                })

                it('should verify elements are not existing', async () => {
                    const nonExistingElements = multiRemoteBrowser.$$('non-existing-element')

                    await expect(nonExistingElements).not.toBeExisting()
                    await expect(await nonExistingElements).not.toBeExisting()
                })

                it('should fails isDisplayed on non-existing elements', async () => {
                    const nonExistingElements = multiRemoteBrowser.$$('non-existing-element')

                    await expect(expect(nonExistingElements).toBeDisplayed()).rejects.toThrow(/at least one result/)
                })

                it('should verify elements are not existing for selected remote', async () => {
                    // TODO one day we should have select on MultiRemoteElement[]
                    const nonExistingElements = multiRemoteBrowser.unstable_select('firefox').$$('non-existing-element')

                    await expect(nonExistingElements).not.toBeExisting()
                })

                it('should verify elements are refetch when not available initially', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                    const h1 = multiRemoteBrowser.$$('h1')

                    const expects = expect(h1).toBeDisplayed({ wait: 1000 })
                    const makeFirefoxElementDisplayable = await new Promise<void>((resolve) => setTimeout( async () =>{
                        await multiRemoteBrowser.getInstance('firefox').url('https://guinea-pig.webdriver.io/')
                        resolve()
                    } , 500))

                    await expects
                    await makeFirefoxElementDisplayable
                })

                it('should be able to query isExisting on elements never existed', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    const h1 = multiRemoteBrowser.$$('h1')

                    await expect(h1).not.toBeExisting()
                })

                // TODO: Maybe one day when select exists on $$()
                // it('should be able to query isDisplayed on elements never existed for a specific browser', async () => {
                //     await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                //     const h1 = multiRemoteBrowser.$$('h1')

                //     await expect(h1.unstable_select('firefox')).not.toBeDisplayed()
                //     await expect(h1.unstable_select('chrome')).toBeDisplayed()
                // })

                it('should be able to query isDisplayed on elements never existed for a specific browser', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                    await expect(multiRemoteBrowser.unstable_select('firefox').$$('h1')).not.toExist()
                    await expect(multiRemoteBrowser.unstable_select('chrome').$$('h1')).toBeDisplayed()
                })

                // TODO waiting fix, see https://github.com/webdriverio/webdriverio/issues/15550
                it.skip('should show error message when querying isDisplayed on an element that no longer exist on a specific browser', async () => {
                    const h1Firefox = multiRemoteBrowser.unstable_select('firefox').$$('h1')

                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')

                    await expect(expect(h1Firefox).toBeDisplayed()).rejects.toThrow(/at least one result/)
                })

                it('should be able to query isExisting on elements no longer existing', async () => {
                    const h1Firefox = multiRemoteBrowser.unstable_select('firefox').$$('h1')
                    const h1Chrome = multiRemoteBrowser.unstable_select('chrome').$$('h1')
                    const h1MultiRemote = multiRemoteBrowser.$$('h1')

                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    await expect(h1Firefox).not.toExist()
                    await expect(h1Chrome).not.toExist()
                    await expect(h1MultiRemote).not.toExist()
                })

                it('should display failure message on elements that never existed', async () => {
                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    await expect(expect(multiRemoteBrowser.$$('h1')).toBeDisplayed()).rejects.toThrow(/at least one result/)
                })

                it('should be able to query isExisting on element no longer existing and one still existing', async () => {
                    const h1MultiRemote = multiRemoteBrowser.$$('h1')

                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    await expect(expect(h1MultiRemote).toExist()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\$\(`h1`\) to exist/)
                })

                it('should be able to query not isExisting on element no longer existing and one still existing', async () => {
                    const h1MultiRemote = multiRemoteBrowser.$$('h1')

                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    await expect(expect(h1MultiRemote).not.toExist()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\$\(`h1`\) not to exist/)
                })

                // TODO waiting fix, see https://github.com/webdriverio/webdriverio/issues/15550
                it.skip('should be able to query isDisplayed on element no longer existing', async () => {
                    const h1 = multiRemoteBrowser.$$('h1')

                    await multiRemoteBrowser.getInstance('firefox').url('about:blank')
                    await multiRemoteBrowser.getInstance('chrome').url('about:blank')

                    await expect(h1).not.toBeDisplayed()
                     await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/Expect multi-remote<(chrome, firefox)|(firefox, chrome)>\.\$\$\(`h1`\) not to be displayed/)
                })
            })
        })

        describe('toHave Matchers', () => {

            describe('Single element', () => {
                it('should verify element have text with one expect value', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toHaveText('WebdriverJS Testpage')
                    await expect(await h1).toHaveText('WebdriverJS Testpage')
                })

                it('should verify element have text with multi-remote expect values', async () => {
                    const h1 = multiRemoteBrowser.$('h1')

                    await expect(h1).toHaveText({
                        'firefox': 'WebdriverJS Testpage',
                        'chrome': 'WebdriverJS Testpage',
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
