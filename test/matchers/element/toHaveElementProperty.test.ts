import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'

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

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'foobar', { wait: 1 })

        expect(result.pass).toBe(false)
    })

    test('should return true if values match', async () => {
        const el = await $('sel')

        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'iphone', { wait: 1 })
        expect(result.pass).toBe(true)
    })

    test('with RegExp should return true if values match', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('iphone')

        const result = await toHaveElementProperty.call({}, el, 'property', /iPhOnE/i)

        expect(result.pass).toBe(true)
    })

    test('should return false for null input', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(undefined)

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'iphone', { wait: 1 })

        expect(result.pass).toBe(false)
    })

    test('should return true if value is null', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue('Test Value')

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', null as any)

        expect(result.pass).toBe(true)
    })

    test('should return false if value is non-string', async () => {
        const el = await $('sel')
        el.getProperty = vi.fn().mockResolvedValue(5)

        const result = await toHaveElementProperty.bind({ isNot: true })(el, 'property', 'Test Value')

        expect(result.pass).toBe(false)
    })

    describe('failure with RegExp when value does not match', () => {
        let result: any

        beforeEach(async () => {
            const el = await $('sel')
            el.getProperty = vi.fn().mockResolvedValue('iphone')

            result = await toHaveElementProperty.call({}, el, 'property', /WDIO/)
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
