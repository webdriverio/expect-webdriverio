import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'
import type { AssertionResult } from 'expect-webdriverio'

vi.mock('@wdio/globals')

describe('toHaveElementProperty', () => {

    test('ignore case of stringified value', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        const result = await toHaveElementProperty.call({}, el, 'property', 'iPhone', { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion })

        expect(result.pass).toBe(true)
        expect(el.getProperty).toHaveBeenCalledTimes(1)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveElementProperty',
            expectedValue: ['property', 'iPhone'],
            options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveElementProperty',
            expectedValue: ['property', 'iPhone'],
            options: { wait: 0, ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('assymeric match', async () => {
        const el = await $('sel')

        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.call({}, el, 'property', expect.stringContaining('phone'))
        expect(result.pass).toBe(true)
    })

    test('should return false if values dont match', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.bind({})(el, 'property', 'foobar', { wait: 1 })

        expect(result.pass).toBe(false)
    })

    test('should return success (false) if values dont match when isNot is true', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'foobar', { wait: 1 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('should return true if values match', async () => {
        const el = await $('sel')

        el.getProperty = vi.fn().mockResolvedValue('iphone')
        const result = await toHaveElementProperty.bind({})(el, 'property', 'iphone', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('should return failure (true) if values match when isNot is true', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'iphone', { wait: 1 })

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(result.message()).toEqual(`\
Expect $(\`sel\`) not to have property property

Expected [not]: "iphone"
Received      : "iphone"`
        )
    })

    test('with RegExp should return true if values match', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.call({}, el, 'property', /iPhOnE/i)

        expect(result.pass).toBe(true)
    })

    test.for([
        { propertyActualValue: null },
        { propertyActualValue: undefined }]
    )('return false for not defined actual if expected is defined since property does not exist', async ( { propertyActualValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(propertyActualValue)

        const result = await toHaveElementProperty.bind({})(el, 'property', 'iphone', { wait: 1 })
        expect(result.pass).toBe(false)
    })

    test.for([
        { propertyActualValue: null },
        { propertyActualValue: undefined }]
    )('return success (false) for not defined actual and defined expected when isNot is true since property does not exist', async ({ propertyActualValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(propertyActualValue)

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'iphone', { wait: 1 })

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test.for([
        { expectedValue: null },
        // { expectedValue: undefined } // fails a bug?
    ]
    )('should return true when property does exist by passing an not defined expected value', async ( { expectedValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('Test Value')

        const result = await toHaveElementProperty.bind({})(el, 'property', expectedValue)

        expect(result.pass).toBe(true)
    })

    test.for([
        { expectedValue: null },
        //{ expectedValue: undefined } // fails a bug?
    ]
    )('should return failure (true) if property exists by passing not defined expected value when isNot is true', async ( { expectedValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('Test Value')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', expectedValue)

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })

    // Bug? When requesting to have element property and it does exist should we return true here?
    test.skip('return true if property is present', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('Test Value')

        const result = await toHaveElementProperty.bind({})(el, 'property')
        expect(result.pass).toBe(true)
    })

    // Bug? When requesting to not have element property and it does exist should we have a failure (pass=true?
    test.skip('return failure (true) if property is present when isNot is true', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('Test Value')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property')
        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
    })

    test.for([
        { expectedValue: null },
        { expectedValue: undefined }
    ]
    )('return false if property is not present', async ({ expectedValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(expectedValue)

        const result = await toHaveElementProperty.bind({})(el, 'property')
        expect(result.pass).toBe(false)
    })
    test.for([
        { expectedValue: null },
        { expectedValue: undefined }
    ]
    )('return success (false) if value is not present when isNot is true', async ({ expectedValue }) => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(expectedValue)

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property')

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    test('should return false if value is non-string', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(5)

        const result = await toHaveElementProperty.bind({})(el, 'property', 'Test Value')
        expect(result.pass).toBe(false)
    })

    test('should return success (false) if value is non-string when isNot is true', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(5)

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'Test Value')

        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
    })

    describe('failure with RegExp when value does not match', () => {
        let result: AssertionResult

        beforeEach(async () => {
            const el = await $('sel')
            el.getProperty = vi.fn().mockResolvedValue('iphone')

            result = await toHaveElementProperty.call({}, el, 'property', /WDIO/, { wait: 1 })
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have property')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/WDIO/')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('iphone')
            })
        })
    })
})
