import { expectTypeOf } from 'vitest'
import { browser, $ } from '@wdio/globals'
import { expect as wdioExpect } from 'expect-webdriverio'

const booleanPromise: Promise<boolean> = Promise.resolve(true)

// The hybrid Jasmine `expect`: Jasmine sync matchers stay sync, WebdriverIO and Jasmine async matchers return a promise
export function globalExpect() {
    expectTypeOf(expect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
    expectTypeOf(expect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
    expectTypeOf(expect(true).toBe(true)).toEqualTypeOf<void>()
    expectTypeOf(expect(true).not.toBe(false)).toEqualTypeOf<void>()
    expectTypeOf(expect(booleanPromise).toBeResolvedTo(true)).toEqualTypeOf<PromiseLike<void>>()
    expectTypeOf(expect(browser).toHaveTitle(expect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
    // @ts-expect-error a Jest matcher, not on the Jasmine `expect`
    expect({ a: 1 }).toHaveProperty('a')
    // @ts-expect-error a Jest promise modifier, not on the Jasmine `expect`
    expect(booleanPromise).resolves.toBe(true)
}

// The Jest-based `expect` of expect-webdriverio, whatever the global `expect` is
export function exportedExpect() {
    expectTypeOf(wdioExpect(browser).toHaveTitle('foo')).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect($('h1')).not.toBeDisplayed()).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect(true).toBe(true)).toEqualTypeOf<void>()
    expectTypeOf(wdioExpect({ a: 1 }).toHaveProperty('a')).toEqualTypeOf<void>()
    expectTypeOf(wdioExpect({ a: 1 }).not.toMatchObject({ a: 2 })).toEqualTypeOf<void>()
    expectTypeOf(wdioExpect(booleanPromise).resolves.toBe(true)).toEqualTypeOf<Promise<void>>()
    expectTypeOf(wdioExpect(browser).toHaveTitle(wdioExpect.stringContaining('foo'))).toEqualTypeOf<Promise<void>>()
}
