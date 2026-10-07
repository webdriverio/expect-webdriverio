import { expectTypeOf } from 'vitest'
import { browser, $ } from '@wdio/globals'
import { expect as wdioExpect } from 'expect-webdriverio'

describe('WebdriverIO testrunner with Mocha', () => {
    const booleanPromise: Promise<boolean> = Promise.resolve(true)

    describe('global `expect` of `@wdio/globals/types`', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(expect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(expect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jest matchers', async () => {
            expectTypeOf(expect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
        })

        it('should have resolves for a promise', async () => {
            expectTypeOf(expect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should have the asymmetric matchers', async () => {
            expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
        })
    })

    describe('`expect` export of expect-webdriverio', () => {
        it('should have the WDIO matchers', async () => {
            expectTypeOf(wdioExpect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
            expectTypeOf(wdioExpect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
        })

        it('should have the Jest matchers', async () => {
            expectTypeOf(wdioExpect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
        })

        it('should have resolves for a promise', async () => {
            expectTypeOf(wdioExpect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
        })

        it('should have the asymmetric matchers', async () => {
            expectTypeOf(wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
        })
    })
})
