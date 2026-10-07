import { expectTypeOf } from 'vitest'
import { browser, $ } from '@wdio/globals'
import { expect as wdioExpect } from 'expect-webdriverio'

describe('WebdriverIO testrunner with Jasmine', () => {
    const booleanPromise: Promise<boolean> = Promise.resolve(true)

    // Jasmine sync matchers stay sync, WebdriverIO and Jasmine async matchers return a promise
    describe('global hybrid `expect` of `@wdio/jasmine-framework`', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(expect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jasmine sync matchers', async () => {
            expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(expect(true).not.toBe(false)).toEqualTypeOf<void>()
        })

        it('should have the Jasmine async matchers', async () => {
            expectTypeOf(expect(booleanPromise).toBeResolvedTo(true)).toEqualTypeOf<PromiseLike<void>>()
        })

        it('should have the asymmetric matchers', async () => {
            expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
        })

        it('should not have the Jest matchers', async () => {
            // @ts-expect-error a Jest matcher, not on the Jasmine `expect`
            expect({ a: 1 }).toHaveProperty('a')
            // @ts-expect-error a Jest promise modifier, not on the Jasmine `expect`
            expect(booleanPromise).resolves.toBe(true)
        })
    })

    // The adapter registers the WDIO matchers on `expectAsync`
    describe('`expectAsync`', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(expectAsync(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expectAsync($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jasmine async matchers', async () => {
            expectTypeOf(expectAsync(booleanPromise).toBeResolvedTo(true)).toEqualTypeOf<PromiseLike<void>>()
        })
    })

    // The Jest-based `expect`, whatever the global `expect` is
    describe('`expect` export of expect-webdriverio', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(wdioExpect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(wdioExpect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jest matchers', async () => {
            expectTypeOf(wdioExpect(true).toBe(true)).toEqualTypeOf<void>()
            expectTypeOf(wdioExpect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
            expectTypeOf(wdioExpect({ a: 1 }).not.toMatchObject({ a: 2 })).toEqualTypeOf<void>()
        })

        it('should have resolves for a promise', async () => {
            expectTypeOf(wdioExpect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should have the asymmetric matchers', async () => {
            expectTypeOf(wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
        })
    })
})
