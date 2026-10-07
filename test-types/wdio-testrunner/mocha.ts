import { expectTypeOf } from 'vitest'
import { browser, $ } from '@wdio/globals'
import { expect as wdioExpect } from 'expect-webdriverio'

const booleanPromise: Promise<boolean> = Promise.resolve(true)

export function globalExpect() {
    expectTypeOf(expect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
    expectTypeOf(expect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
    expectTypeOf(expect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
    expectTypeOf(expect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
    expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
}

export function exportedExpect() {
    expectTypeOf(wdioExpect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
    expectTypeOf(wdioExpect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
}
