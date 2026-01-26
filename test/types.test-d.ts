import { describe, expect, expectTypeOf, test } from 'vitest'
import { $, $$ } from '@wdio/globals'
import type { Matchers, Inverse } from 'expect'
import expectLib from 'expect'
import { expect as expectWdio } from '../src/index.js'

describe('Type test', () => {

    describe('Expects + Promise matchers & basic matchers', () => {

        test('Jest "expect" lib type tests as baseline', () => {
            // Basic matchers
            expectTypeOf(expectLib(true)).toExtend<Matchers<void, boolean> & Inverse<Matchers<void, boolean>>>()
            expectTypeOf(expectLib(true).toBe(true)).toBeVoid()
            expectTypeOf(expectLib(true).toBe(true)).not.toExtend<Promise<void>>()
            expectTypeOf(expectLib(Promise.resolve(true)).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectLib(Promise.resolve(true)).resolves.toBe(expect.any)).resolves.toBeVoid()

            // element matchers are not available in 'expect' lib
            expectTypeOf(expectLib($('element')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectLib($('element'))).not.toHaveProperty('toHaveText')
            expectTypeOf(expectLib($$('elements')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectLib($$('elements'))).not.toHaveProperty('toHaveText')
        })

        test('Wdio expect & matchers type tests', () => {
        // Basic matchers
            expectTypeOf(expectWdio(true)).toExtend<Matchers<void, boolean> & Inverse<Matchers<void, boolean>>>()
            expectTypeOf(expectWdio(true).toBe(true)).toBeVoid()
            expectTypeOf(expectWdio(true).toBe(true)).not.toExtend<Promise<void>>()
            expectTypeOf(expectWdio(Promise.resolve(true)).toBe(true))
            expectTypeOf(expectWdio(Promise.resolve(true)).resolves.toBe(true)).resolves.toBeVoid()

            // element matchers
            expectTypeOf(expectWdio($('element')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectWdio($('element')).toHaveText('test')).not.toBeVoid()
            expectTypeOf(expectWdio($('element')).toHaveText('test')).toExtend<Promise<void>>()
            expectTypeOf(expectWdio($$('elements')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectWdio($$('elements')).toHaveText('test')).toExtend<Promise<void>>()
            expectTypeOf(expectWdio($$('elements')).toHaveText('test')).not.toBeVoid()

        })

        test('Wdio soft expect & matchers type tests', () => {
        // Basic matchers
            expectTypeOf(expectWdio.soft(true)).toExtend<Matchers<void, boolean> & Inverse<Matchers<void, boolean>>>()
            expectTypeOf(expectWdio.soft(true).toBe(true)).toExtend<void>()
            expectTypeOf(expectWdio.soft(true).toBe(true)).not.toExtend<Promise<void>>()
            // TODO to fix one day? When non elements matchers + promise, we should stick to void and not have Promise<void>
            //expectTypeOf(expectWdio.soft(Promise.resolve(true)).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectWdio.soft(Promise.resolve(true)).resolves.toBe(expect.any)).toExtend<Promise<void>>()

            // element matchers
            expectTypeOf(expectWdio($('element')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectWdio($('element')).toHaveText('test')).not.toBeVoid()
            expectTypeOf(expectWdio($('element')).toHaveText('test')).toExtend<Promise<void>>()
            expectTypeOf(expectWdio($$('elements')).toBe(expect.any)).toBeVoid()
            expectTypeOf(expectWdio($$('elements')).toHaveText('test')).toExtend<Promise<void>>()
            expectTypeOf(expectWdio($$('elements')).toHaveText('test')).not.toBeVoid()
        })
    })
})
