import { describe, it, expect, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'
import { notFoundElementFactory } from './__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe('globals mock', () => {
    describe($, () => {
        it('should return a ChainablePromiseElement', async () => {
            const el = $('foo')

            // It behaves like a promise
            expect(el).toHaveProperty('then')
            // @ts-expect-error
            expect(typeof el.then).toBe('function')
        })

        it('should resolve to an element', async () => {
            const el = await $('foo')

            expect(el.selector).toBe('foo')
            // The resolved element should not be the proxy, but the underlying mock
            expect(el.getElement).toBeDefined()
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

        it('should allow chaining simple methods', async () => {
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

        it('should returns ElementArray on getElements', async () => {
            const els = await $$('foo')

            expect(await els.getElements()).toEqual(els)
        })

        it('should return a promise-like object when accessing index out of bounds', () => {
            const el = $$('foo')[3]
            // It shouldn't throw synchronously
            expect(el).toBeDefined()
            expect(el).toBeInstanceOf(Promise)
            expect(typeof (el as any).then).toBe('function')

            // Methods should return a Promise
            const p1 = el.getElement()
            expect(p1).toBeInstanceOf(Promise)
            // catch unhandled rejection to avoid warnings
            p1.catch(() => {})

            const p2 = el.getText()
            expect(p2).toBeInstanceOf(Promise)
            // catch unhandled rejection to avoid warnings
            p2.catch(() => {})
        })

        it('should throw "Index out of bounds" when awaiting index out of bounds', async () => {
            await expect(async () => await $$('foo')[3]).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
            await expect(async () => await $$('foo')[3].getElement()).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
            await expect(async () => await $$('foo')[3].getText()).rejects.toThrow('Index out of bounds! $$(foo) returned only 2 elements.')
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
})
