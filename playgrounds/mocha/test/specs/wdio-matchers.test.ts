import { browser, $, $$ } from '@wdio/globals'
import { some } from 'expect-webdriverio/api'

describe('WebdriverIO Custom Matchers', () => {
    beforeEach(async () => {
        await browser.url('https://guinea-pig.webdriver.io/')
    })

    describe('Browser matchers', () => {
        it('should verify browser title', async () => {
            await expect(browser).toHaveTitle(/WebdriverJS.*/)
        })

        it('should verify browser title contains text', async () => {
            await expect(browser).toHaveTitle(expect.stringContaining('WebdriverJS'))
        })

        it('should verify browser URL', async () => {
            await expect(browser).toHaveUrl('https://guinea-pig.webdriver.io/')
        })

        it('should verify URL contains path', async () => {
            await expect(browser).toHaveUrl(expect.stringContaining('webdriver.io'))
        })

        it('should verify not localStorage item', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', 'value')
        })

        it('should verify not localStorage item with options', async () => {
            await expect(browser).not.toHaveLocalStorageItem('key', expect.anything(), { wait: 0 })
            await expect(browser).not.toHaveLocalStorageItem('key')
        })
    })

    describe('Cookie matcher', () => {
        afterEach(async () => {
            await browser.deleteCookies(['lang'])
        })

        it('should verify a cookie and its value', async () => {
            await browser.setCookies({ name: 'lang', value: 'en' })

            await expect(browser).toHaveCookie('lang')
            await expect(browser).toHaveCookie('lang', 'en')
            await expect(browser).toHaveCookie('lang', 'EN', { ignoreCase: true })
            await expect(browser).not.toHaveCookie('lang', 'fr')
            await expect(browser).not.toHaveCookie('tracking')
        })

        it('should show a missing cookie in the error message', async () => {
            await expect(expect(browser).toHaveCookie('tracking', 'yes', { wait: 0 })).rejects.toThrow(/to have cookie tracking[\s\S]*Received: no cookie/)
        })
    })

    describe('Session storage matcher', () => {
        afterEach(async () => {
            await browser.execute(() => sessionStorage.clear())
        })

        it('should verify a session storage item and its value', async () => {
            await browser.execute(() => sessionStorage.setItem('theme', 'dark'))

            await expect(browser).toHaveSessionStorageItem('theme')
            await expect(browser).toHaveSessionStorageItem('theme', 'dark')
            await expect(browser).toHaveSessionStorageItem('theme', 'DARK', { ignoreCase: true })
            await expect(browser).not.toHaveSessionStorageItem('theme', 'light')
            // The item is in the session storage only
            await expect(browser).not.toHaveLocalStorageItem('theme')
        })

        it('should show a missing item in the error message', async () => {
            await expect(expect(browser).toHaveSessionStorageItem('cartId', 'abc', { wait: 0 })).rejects.toThrow(/to have sessionStorage item cartId[\s\S]*Received: no item/)
        })
    })

    describe('Form field matchers', () => {
        beforeEach(async () => {
            await browser.execute(() => {
                document.body.insertAdjacentHTML('beforeend', '<form id="fields"><input id="email" required><input id="order" readonly><textarea id="comment"></textarea></form>')
            })
        })

        it('should verify a required field', async () => {
            await expect($('#email')).toBeRequired()
            await expect($('#comment')).not.toBeRequired()
            await expect($('#fields')).not.toBeRequired()
        })

        it('should verify a read only field', async () => {
            await expect($('#order')).toBeReadOnly()
            await expect($('#email')).not.toBeReadOnly()
            await expect(expect($('#email')).toBeReadOnly({ wait: 0 })).rejects.toThrow(/to be read only[\s\S]*Received: "not read only"/)
        })
    })

    describe('Window count matcher', () => {
        it('should verify the number of windows of the session', async () => {
            const firstWindow = await browser.getWindowHandle()
            await expect(browser).toHaveWindowCount(1)

            await browser.newWindow('https://guinea-pig.webdriver.io/')
            await expect(browser).toHaveWindowCount(2)
            await expect(browser).toHaveWindowCount({ gte: 2 })
            await expect(browser).not.toHaveWindowCount(1)

            const newWindow = (await browser.getWindowHandles()).find((handle) => handle !== firstWindow)
            await browser.switchToWindow(newWindow!)
            await browser.closeWindow()
            await browser.switchToWindow(firstWindow)
            await expect(browser).toHaveWindowCount(1)
        })

        it('should show the number of windows in the error message', async () => {
            await expect(expect(browser).toHaveWindowCount(3, { wait: 0 })).rejects.toThrow(/to have window count[\s\S]*Expected: 3[\s\S]*Received: 1/)
        })
    })

    describe('Element existence matchers', () => {
        it('should verify element exists', async () => {
            const githubLink = $('#githubRepo')

            await expect(githubLink).toExist()
            await expect(await githubLink).toExist()
            await expect(await githubLink).toBeExisting()
        })

        it('should verify all elements are existing', async () => {
            const githubLink = $$('#githubRepo')

            await expect(githubLink).toExist()
            await expect(await githubLink).toExist()
            await expect(await githubLink).toBeExisting()
        })

        it('should verify element does not exist', async () => {
            const nonExistent = await $('.non-existent-element')

            await expect(nonExistent).not.toExist()
            await expect(await nonExistent).not.toExist()
        })

        it('should verify elements do not exist', async () => {
            const nonExistent = $$('.non-existent-elements')

            await expect(nonExistent).not.toExist()
            await expect(await nonExistent).not.toExist()
        })

    })

    describe('Element visibility matchers', () => {
        it('should verify element is displayed', async () => {
            const header = $('header')

            await expect(header).toBeDisplayed()
            await expect(await header).toBeDisplayed()
        })

        it('should verify element is displayed in viewport', async () => {
            const githubLink = await $('#githubRepo')

            await expect(githubLink).toBeDisplayedInViewport()
        })

        it('should verify elements are displayed', async () => {
            const header = $$('header')

            await expect(header).toBeDisplayed()
            await expect(await header).toBeDisplayed()
            await expect(await header.filter(n => n.isExisting())).toBeDisplayedInViewport()
        })

        it('should verify that some elements are displayed', async () => {
            const header = $$('header')

            await expect(some(header)).toBeDisplayed()
            await expect(some(await header)).toBeDisplayed()
            await expect(some(await header.filter(n => n.isExisting()))).toBeDisplayedInViewport()
        })

        it('should be able to query isDisplayed on element that never existed', async () => {
            await browser.url("about:blank")
            const h1 = $$('h1')

            await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/at least one result/)
        })

        // TODO waiting fix, see https://github.com/webdriverio/webdriverio/issues/15550
        it.skip('should be able to query isDisplayed on element no longer existing', async () => {
            await browser.url('https://guinea-pig.webdriver.io/')
            const h1 = $$('h1')
            await expect(h1).toBeDisplayed()

            await browser.url('about:blank')

            await expect(expect(h1).toBeDisplayed()).rejects.toThrow(/at least one result/)
        })
    })

    describe('Element state matchers', () => {
        it('should verify element is clickable', async () => {
            const button = await $('.btn1')
            await expect(button).toBeClickable()
        })

        it('should verify element is enabled', async () => {
            const button = await $('.btn1')
            await expect(button).toBeEnabled()
        })

        it('should verify button is not disabled', async () => {
            const button = await $('.btn1')
            await expect(button).not.toBeDisabled()
        })

        it('should verify element is stable', async () => {
            await expect($('.btn1')).toBeStable()
        })

        it('should verify that an element that moves is not stable', async () => {
            await browser.execute(() => {
                const style = document.createElement('style')
                style.id = 'moving-style'
                style.textContent = '@keyframes move { from { transform: translateX(0) } to { transform: translateX(200px) } }'
                const moving = document.createElement('div')
                moving.id = 'moving'
                moving.textContent = 'moving'
                moving.style.animation = 'move 1s linear infinite'
                document.head.append(style)
                document.body.append(moving)
            })

            try {
                await expect($('#moving')).not.toBeStable()
                await expect(expect($('#moving')).toBeStable({ wait: 300 })).rejects.toThrow('to be stable')
            } finally {
                await browser.execute(() => {
                    document.getElementById('moving')?.remove()
                    document.getElementById('moving-style')?.remove()
                })
            }
        })
    })

    describe('Element text matchers', () => {
        it('should verify element text', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toBeDisplayed()
            await expect(secondPageLink).toHaveText('two')
        })

        it('should verify element contains text', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText(expect.stringContaining('Test CSS'))
        })

        it('should verify text with options', async () => {
            const heading = await $$('h1')[1]  // Second h1 has text
            await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
        })

        describe('Multiple Elements', () => {
            describe('Awaited', () => {
                it('should verify text with array of text & with options with awaited ChainablePromiseArray', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify some text with array of text', async () => {
                    const heading = await $$('h1')

                    await expect(some(heading)).toHaveText(['DoesNotMatch', 'Test CSS Attributes'])
                    await expect(some(heading)).toHaveText('Test CSS Attributes')
                    await expect(some(heading)).toHaveText('test css', { ignoreCase: true, containing: true })
                })

                it('should verify text with array of text without exact array match', async () => {
                    const heading = await $$('h1')
                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'])
                })

                it('should fails verify a single text found in only one element', async () => {
                    const heading = await $$('h1')
                    await expect(expect(heading).toHaveText('Test CSS Attributes', { ignoreCase: true, containing: true, wait: 500 })).rejects.toThrow()
                })

                it('should verify text with options with awaited filtered ChainablePromiseArray', async () => {
                    const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))
                    expect(heading.length).toBe(1)
                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with awaited getElements ChainablePromiseArray', async () => {
                    const heading = await $$('h1').getElements()

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with filetered awaited getElements ChainablePromiseArray', async () => {
                    const heading = (await $$('h1').getElements()).filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })


                describe('Empty elements & Array length mismatch', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = await $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = await $$('h10')

                        expect(heading.length).toBe(0)
                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is not enough expected values', async () => {
                        const heading = await $$('h1')

                        expect(heading.length).toBe(2)
                        await expect(heading[0]).toHaveText('WebdriverJS Testpage')
                        await expect(expect(heading).toHaveText(['WebdriverJS Testpage'])).rejects.toThrow()
                    })

                    it('should fails if there is too many expected values', async () => {
                        const heading = await $$('h1')

                        expect(heading.length).toBe(2)
                        await expect(heading[0]).toHaveText('WebdriverJS Testpage')
                        await expect(heading[1]).toHaveText('Test CSS Attributes')
                        await expect(expect(heading).toHaveText(['WebdriverJS Testpage', 'Test CSS Attributes', 'tooMuchValue!'])).rejects.toThrow()
                    })
                })
            })

            describe('Non-awaited', () => {

                it('should verify text with options with non-awaited ChainablePromiseArray', async () => {
                    const heading = $$('h1')

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited filtered ChainablePromiseArray', async () => {
                    const heading = $$('h1').filter(async (el) => (await el.getText()).includes('Test CSS'))

                    await expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })
                })

                it('should verify text with options with non-awaited getElements ChainablePromiseArray', async () => {
                    const heading = $$('h1').getElements()

                    await expect(heading).toHaveText(['WebdriverJS Testpage', 'Test css'], { ignoreCase: true, containing: true })
                })

                describe('Empty elements', () => {
                    it('should fails if there is no elements with Element[]', async () => {
                        const heading = $$('h1').filter(async (el) => (await el.getText()).includes('test'))

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })

                    it('should fails if there is no elements with ElementArray', async () => {
                        const heading = $$('h10')

                        await expect(expect(heading).toHaveText('TEST CSS ATTRIBUTES', { ignoreCase: true, containing: true })).rejects.toThrow()
                    })
                })
            })
        })
    })

    describe('Element attribute matchers', () => {
        it('should verify element exists', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href')
        })

        it('should verify element exists immediately', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', expect.anything(), { wait: 0 })
        })

        it('should verify element has attribute', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', './two.html')
        })

        it('should verify element does not exist', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).not.toHaveAttribute('non-existent-attribute')
        })

        it('should verify element does not exist immediately', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).not.toHaveAttribute('non-existent-attribute', expect.anything(), { wait: 0 })
        })

        it('should verify attribute contains value', async () => {
            const secondPageLink = await $('#secondPageLink')
            await expect(secondPageLink).toHaveAttribute('href', expect.stringContaining('two'))
        })

        it('should verify element has class', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementClass('btn1')
        })

        it('should verify element has multiple classes', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementClass(expect.stringContaining('btn'))
        })

        it('compares each class, also with an asymmetric matcher', async () => {
            // <div class="box purple" id="purplebox">
            const box = $('#purplebox')
            await expect(box).toHaveElementClass(expect.oneOf('red', 'purple'))
            await expect(box).toHaveElementClass(expect.stringMatching(/^purp/))
            await expect(box).not.toHaveElementClass(expect.stringContaining('box purple'), { wait: 0 })
            // the full attribute
            await expect(box).toHaveAttribute('class', expect.stringContaining('box purple'))
        })

        it('fails for an array of expected classes on a single element', async () => {
            // @ts-expect-error an array on $() fails: use expect.oneOf() for "has any", and 1 assertion for each class for "has all"
            await expect(expect($('#purplebox')).toHaveElementClass(['box', 'purple'], { wait: 0 })).rejects.toThrow('to have class')
        })
    })

    describe('Element property matchers', () => {
        it('should verify element property value', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', 'submit')
        })

        it('should verify element property value with asymmetric matcher', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', expect.stringContaining('submit'))
        })

        it('should verify that element property exists', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type')
        })

        it('should verify that element property exists immediately', async () => {
            const button = await $('.btn1')
            await expect(button).toHaveElementProperty('type', expect.anything(), { wait: 0 })
        })

        it('should verify that element property does not exist', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('doesNNotExist')
        })

        it('should verify that element property does not exist immediately', async () => {
            const button = await $('.btn1')
            await expect(button).not.toHaveElementProperty('doesNNotExist', expect.anything(), { wait: 0 })
        })
    })

    describe('Element value matchers', () => {
        it('should verify input value', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.setValue('testuser')
            await expect(searchInput).toHaveValue('testuser')
        })

        it('should verify value contains text', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.setValue('testuser123')
            await expect(searchInput).toHaveValue(expect.stringContaining('testuser'))
        })
    })

    describe('Element tag name matcher', () => {
        it('should verify the tag name of an element', async () => {
            await expect($('header h1')).toHaveTagName('h1')
            await expect($('header h1')).toHaveTagName('H1', { ignoreCase: true })
            await expect($('header h1')).not.toHaveTagName('div')
            await expect($$('header h1')).toHaveTagName(expect.arrayContaining(['h1']))
            await expect(expect($('header h1')).toHaveTagName('div', { wait: 0 })).rejects.toThrow('to have tag name')
        })
    })

    describe('Element size matchers', () => {
        it('should verify the size, the width and the height of an element', async () => {
            const h1 = $('header h1')
            const { width, height } = await h1.getSize()

            await expect(h1).toHaveSize({ width, height })
            await expect(h1).toHaveSize({ width: { gte: width - 1 }, height })
            await expect(h1).toHaveSize(expect.objectContaining({ height }))
            await expect(h1).toHaveWidth(width)
            await expect(h1).toHaveWidth(expect.closeTo(width + 0.4, 0))
            await expect(h1).toHaveHeight({ gte: 1 })
            await expect(h1).not.toHaveSize({ width: width + 1, height })
        })

        it('should fail with the size in the error message', async () => {
            const h1 = $('header h1')
            const { width, height } = await h1.getSize()

            await expect(expect(h1).toHaveSize({ width: width + 1, height }, { wait: 0 })).rejects.toThrow('to have size')
            await expect(expect(h1).toHaveWidth(width + 1, { wait: 0 })).rejects.toThrow('to have width')
        })

        it('should compare the list of the sizes of $$() with a list matcher', async () => {
            const { width, height } = await $('header h1').getSize()

            await expect($$('header h1')).toHaveSize(expect.arrayContaining([{ width, height }]))
            await expect($$('header h1')).not.toHaveSize(expect.arrayContaining([{ width: width + 1, height }]))
        })
    })

    describe('Elements array matchers', () => {
        it('should verify elements array size', async () => {
            const links = await $$('a')
            await expect(links).toBeElementsArrayOfSize(7)
        })

        it('should verify elements array size with comparison', async () => {
            const links = await $$('a')
            await expect(links).toBeElementsArrayOfSize({ gte: 5 })
            await expect(links).toBeElementsArrayOfSize({ lte: 10 })
        })

        it('should works with non-awaited elements', async () => {
            await expect($$('a')).toBeElementsArrayOfSize({ gte: 5 })
            await expect($$('a')).toBeElementsArrayOfSize({ lte: 10 })
        })

        it('should works with filtered elements', async () => {
            await expect($$('a').filter(el => el.isDisplayed())).toBeElementsArrayOfSize({ gte: 1 })
        })

    })

    describe('HTML matchers', () => {
        it('should verify element has specific HTML', async () => {
            const element = await $('header h1')
            await expect(element).toHaveHTML('<h1>WebdriverJS Testpage</h1>', {
                includeSelectorTag: true,
                prettify: true,
                pierceShadowRoot: true,
                removeCommentNodes: true,
                excludeElements: ['.ignore-this']
            })
        })
    })

    describe('Focus matchers', () => {
        it('should verify element is focused', async () => {
            const searchInput = await $('.searchinput')
            await searchInput.click()

            await expect(searchInput).toBeFocused()
        })
    })

    describe('With wait options', () => {
        it('should wait for condition to be met', async () => {
            const heading = await $('header h1')
            await expect(heading).toBeDisplayed({ wait: 5000 })
        })

        it('should use custom interval', async () => {
            const header = await $('header')
            await expect(header).toExist({ wait: 3000, interval: 100 })
        })
    })

    describe('Negated matchers', () => {
        it('should work with not', async () => {
            const nonExistent = await $('.non-existent-element-xyz')
            await expect(nonExistent).not.toBeDisplayed()
            await expect(nonExistent).not.toExist()
        })
    })
})
