import { describe, it, expect, vi } from 'vitest'
import { $, $$, browser } from '@wdio/globals'
import { $Factory, browserFactory, chainableElementArrayFactory, elementFactory, notFoundElementFactory } from './__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe('globals mock', () => {
    describe($, () => {
        it('should return a ChainablePromiseElement', async () => {
            const el = $('foo')

            // It behaves like a promise
            expect(el).toHaveProperty('then')
            expect(el).toBeInstanceOf(Promise)
        })

        it('should resolve to an element', async () => {
            const el = await $('foo')

            expect(el.selector).toBe('foo')
            // The resolved element should not be the proxy, but the underlying mock
            expect(el.getElement).toBeDefined()
        })

        it('should resolve to an element on getElement', async () => {
            const el = await $('foo')
            const resolvedEl = await el.getElement()

            expect(resolvedEl).toBe(el)
        })

        it('should allow calling getElement on the chainable promise', async () => {
            const chainable = $('foo')

            // 'getElement' should not be present in the chainable object if checked via `in`
            // based on user request logs: 'getElements' in elements false
            expect('getElement' in chainable).toBe(false)

            // But it should be callable
            const el = chainable.getElement()
            expect(el).toBeInstanceOf(Promise)

            const awaitedEl = await el
            expect(awaitedEl.selector).toBe('foo')
            expect(awaitedEl.getElement).toBeDefined()
        })

        it('should allow calling methods like isEnabled on the chainable promise', async () => {
            const check = $('foo').isEnabled()
            expect(check).toBeInstanceOf(Promise)

            const result = await check
            expect(result).toBe(true)
        })

        it('should allow chaining simple methods with await', async () => {
            const text = await $('foo').getText()

            expect(text).toBe(' Valid Text ')
        })
    })

    describe($$, () => {
        it('should return a ChainablePromiseArray', async () => {
            const els = $$('foo')
            expect(els).toHaveProperty('then')
            // @ts-expect-error
            expect(typeof els.then).toBe('function')
        })

        it('should resolve to an element array', async () => {
            const els = await $$('foo')
            expect(Array.isArray(els)).toBe(true)
            expect(els).toHaveLength(2) // Default length in mock
            expect(els.selector).toBe('foo')
        })

        it('should returns ElementArray on getElements', async () => {
            const els = await $$('foo')

            expect(await els.getElements()).toEqual(els)
        })

        it('should allow calling getElements on the chainable promise', async () => {
            const chainable = $$('foo')
            // 'getElements' should not be present in the chainable object if checked via `in`
            expect('getElements' in chainable).toBe(false)

            // But it should be callable
            const els = await chainable.getElements()
            expect(els).toHaveLength(2) // Default length
        })

        it('should allow iterating if awaited', async () => {
            const els = await $$('foo')
            // map is available on the resolved array
            const selectors = els.map(el => el.selector)
            expect(selectors).toEqual(['foo', 'foo'])
        })

        it('should allow calling methods like isEnabled on elements of chainable promise', async () => {
            const check = $$('foo')[0].isEnabled()
            expect(check).toBeInstanceOf(Promise)

            const result = await check
            expect(result).toBe(true)
        })

        it('should allow chaining simple methods with await', async () => {
            const text = await $$('foo')[0].getText()

            expect(text).toBe(' Valid Text ')
        })

        it('should return a promise-like object when accessing index out of bounds', () => {
            const el = $$('foo')[3]
            // It shouldn't throw synchronously
            expect(el).toBeDefined()
            expect(el).toBeInstanceOf(Promise)

            // Methods should return a Promise
            const getEl = el.getElement()
            expect(getEl).toBeInstanceOf(Promise)
            // catch unhandled rejection to avoid warnings
            getEl.catch(() => {})

            const getText = el.getText()
            expect(getText).toBeInstanceOf(Promise)
            // catch unhandled rejection to avoid warnings
            getText.catch(() => {})
        })

        it('should throw "Index out of bounds" when awaiting index out of bounds', async () => {
            await expect(async () => await $$('foo')[3]).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
            await expect(async () => await $$('foo')[3].getElement()).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
            await expect(async () => await $$('foo')[3].getText()).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
        })

        it('should return same elements in parent $$', async () => {
            const els = await $$('foo')
            const awaitedElements = await els.getElements()

            expect(awaitedElements).toHaveLength(2)
            expect(awaitedElements.parent).not.toBe(browser)
            expect(awaitedElements.foundWith).toBe('$$')
            expect(awaitedElements.selector).toBe('foo')

            const parentBrowser =  awaitedElements.parent
            const parent$$ = parentBrowser[awaitedElements.foundWith as keyof typeof parentBrowser] as Function

            const parentEls = await parent$$.call(parentBrowser, awaitedElements.selector, ...awaitedElements.props)
            const awaitedParentEls = await parentEls.getElements()

            expect(awaitedParentEls.parent).toBe(parentBrowser)
            expect(awaitedParentEls.foundWith).toBe('$$')
            expect(awaitedParentEls.selector).toBe('foo')

            expect(awaitedParentEls.length).toEqual(awaitedElements.length)
            expect(awaitedParentEls[0].selector).toEqual(awaitedElements[0].selector)
            expect(awaitedParentEls[1].selector).toEqual(awaitedElements[1].selector)
            expect(awaitedParentEls).toEqual(awaitedElements)
        })

        it('should return two different $$', async () => {
            const els = await $$('foo')
            const els2 = await $$('foo')
            const awaitedElements = await els.getElements()
            const awaitedElements2 = await els2.getElements()

            expect(awaitedElements).not.toBe(awaitedElements2)

            expect(awaitedElements).toHaveLength(2)
            expect(awaitedElements2).toHaveLength(2)
            expect(awaitedElements.parent).not.toBe(awaitedElements2.parent)
            expect(awaitedElements.foundWith).toBe('$$')
            expect(awaitedElements.selector).toBe('foo')
            expect(awaitedElements2.foundWith).toBe('$$')
            expect(awaitedElements2.selector).toBe('foo')
        })
    })

    describe('browser', () => {
        it('should return an element with the correct selector', async () => {
            expect(browser).toBeDefined()
            expect(browser).toHaveProperty('$')
            expect(browser).toHaveProperty('$$')

            const el = await browser.$('foo')
            expect(el.selector).toBe('foo')

            const els = await browser.$$('foo')
            expect(els).toHaveLength(2)

            expect(el.parent).toBe(browser)
            expect(els.parent).toBe(browser)
        })
    })

    describe('browserFactory', () => {
        it('should return a browser object with $ and $$ not the same as the global', async () => {
            const browser = browserFactory()

            expect(browser).toHaveProperty('$')
            expect(browser).toHaveProperty('$$')
            expect(browser.$).not.toBe($)
            expect(browser.$$).not.toBe($$)

            const el = await browser.$('foo')
            expect(el.selector).toBe('foo')

            const els = await browser.$$('foo')
            expect(els).toHaveLength(2)
        })
    })

    describe('chainableElementArrayFactory', () => {
        it('should return empty element and similar elements in parent $$', async () => {
            const els = await chainableElementArrayFactory('empty', 0)
            const awaitedElements = await els.getElements()

            expect(awaitedElements).toHaveLength(0)
            expect(awaitedElements.parent).not.toBe(browser)
            expect(awaitedElements.foundWith).toBe('$$')
            expect(awaitedElements.selector).toBe('empty')

            const parentBrowser =  awaitedElements.parent
            const parent$$ = parentBrowser[awaitedElements.foundWith as keyof typeof parentBrowser] as Function

            const parentEls = await parent$$.call(parentBrowser, awaitedElements.selector, ...awaitedElements.props)
            const awaitedParentEls = await parentEls.getElements()

            expect(awaitedParentEls.parent).toBe(parentBrowser)
            expect(awaitedParentEls.foundWith).toBe('$$')
            expect(awaitedParentEls.selector).toBe('empty')

            expect(awaitedParentEls.length).toEqual(awaitedElements.length)
            expect(awaitedParentEls).toEqual(awaitedElements)
        })

        it('should return 1 elements and new element in parent $$', async () => {
            const els = await chainableElementArrayFactory('foo', 1)
            const awaitedElements = await els.getElements()

            expect(awaitedElements).toHaveLength(1)
            expect(awaitedElements.parent).not.toBe(browser)
            expect(awaitedElements.foundWith).toBe('$$')
            expect(awaitedElements.selector).toBe('foo')

            const parentBrowser =  awaitedElements.parent
            const parent$$ = parentBrowser[awaitedElements.foundWith as keyof typeof parentBrowser] as Function

            const parentEls = await parent$$.call(parentBrowser, 'fooParent', ...awaitedElements.props)
            const awaitedParentEls = await parentEls.getElements()

            expect(awaitedParentEls.parent).toBe(parentBrowser)
            expect(awaitedParentEls.foundWith).toBe('$$')
            expect(awaitedParentEls.selector).toBe('fooParent')

            expect(awaitedParentEls.length).toEqual(awaitedElements.length)
            expect(awaitedParentEls[0].selector).not.toEqual(awaitedElements[0].selector)
            expect(awaitedParentEls).not.toEqual(awaitedElements)
        })

        it('should have 2 different chainableElementFactory', async () => {
            const els = await chainableElementArrayFactory('foo', 1, browserFactory())
            const els2 = await chainableElementArrayFactory('foo', 2, browserFactory())
            const awaitedElements = await els.getElements()
            const awaitedElements2 = await els2.getElements()

            expect(awaitedElements).toHaveLength(1)
            expect(awaitedElements2).toHaveLength(2)
            expect(awaitedElements.parent).toBe(els.parent)
            expect(awaitedElements2.parent).toBe(els2.parent)
            expect(awaitedElements.parent).not.toBe(awaitedElements2.parent)
            expect(awaitedElements.foundWith).toBe('$$')
            expect(awaitedElements.selector).toBe('foo')
            expect(awaitedElements2.foundWith).toBe('$$')
            expect(awaitedElements2.selector).toBe('foo')

            const parentBrowser =  awaitedElements.parent
            const parent$$ = parentBrowser[awaitedElements.foundWith as keyof typeof parentBrowser] as Function

            const parentEls = await parent$$.call(parentBrowser, 'fooParent', ...awaitedElements.props)
            const awaitedParentEls = await parentEls.getElements()

            expect(awaitedParentEls.parent).toBe(parentBrowser)
            expect(awaitedParentEls.foundWith).toBe('$$')
            expect(awaitedParentEls.selector).toBe('fooParent')

            expect(awaitedParentEls.length).toEqual(awaitedElements.length)
            expect(awaitedParentEls[0].selector).not.toEqual(awaitedElements[0].selector)
            expect(awaitedParentEls).not.toEqual(awaitedElements)

            const parentBrowser2 =  awaitedElements2.parent
            const parent$$2 = parentBrowser2[awaitedElements2.foundWith as keyof typeof parentBrowser2] as Function

            const parentEls2 = await parent$$2. call(parentBrowser2, 'fooParent2', ...awaitedElements2.props)
            const awaitedParentEls2 = await parentEls2.getElements()

            expect(awaitedParentEls2.parent).toBe(parentBrowser2)
            expect(awaitedParentEls2.foundWith).toBe('$$')
            expect(awaitedParentEls2.selector).toBe('fooParent2')

            expect(awaitedParentEls2.length).toEqual(awaitedElements2.length)
            expect(awaitedParentEls2[0].selector).not.toEqual(awaitedElements2[0].selector)
            expect(awaitedParentEls2).not.toEqual(awaitedElements2)
            expect(awaitedParentEls2.parent).not.toBe(awaitedParentEls.parent)
        })
    })

    describe('notFoundElementFactory', () => {
        it('should return false for isExisting', async () => {
            const el = notFoundElementFactory('not-found')
            expect(await el.isExisting()).toBe(false)
        })

        it('should resolve to itself when calling getElement', async () => {
            const el = notFoundElementFactory('not-found')
            expect(await el.getElement()).toBe(el)
        })

        it('should throw error on method calls', async () => {
            const el = notFoundElementFactory('not-found')
            expect(() => el.click()).toThrow("Can't call click on element with selector not-found because element wasn't found")
        })

        it('should throw error when awaiting a method call (sync throw)', async () => {
            const el = notFoundElementFactory('not-found')
            expect(() => el.getText()).toThrow("Can't call getText on element with selector not-found because element wasn't found")
        })
    })

    describe('$Factory', () => {
        it('should take time to await the element', async () => {
            const el = $Factory(elementFactory('foo'), 1000)

            expect(el).toBeInstanceOf(Promise)
            expect('getElement' in el).toBe(false)
            expect('getText' in el).toBe(false)

            const start = performance.now()
            const awaitedEl = await el
            const end = performance.now()

            expect(Math.ceil(end - start)).toBeGreaterThanOrEqual(1000)
            expect('getElement' in awaitedEl).toBe(true)
            expect('getText' in awaitedEl).toBe(true)
            expect(await awaitedEl.getText()).toBe(' Valid Text ')
        })

        it("should take time to await the element's text", async () => {
            const el = $Factory(elementFactory('foo'), 1000)

            expect(el).toBeInstanceOf(Promise)
            expect('getElement' in el).toBe(false)
            expect('getText' in el).toBe(false)

            const start = performance.now()
            const text = await el.getText()
            const end = performance.now()

            expect(Math.ceil(end - start)).toBeGreaterThanOrEqual(1000)
            expect(text).toBe(' Valid Text ')
        })
    })
})
