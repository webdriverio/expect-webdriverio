import { describe, it, expect, vi } from 'vitest'
import { $, $$ } from '@wdio/globals'

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

    describe('$$', () => {
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
    })
})
