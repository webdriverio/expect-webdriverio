import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveValue } from '../../../src/matchers/element/toHaveValue.js'

vi.mock('@wdio/globals')

describe('toHaveValue', () => {
    let el: any

    beforeEach(async () => {
        el = await $('sel')
        el._value = vi.fn().mockImplementation(() => {
            return "This is an example value"
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()
            const result = await toHaveValue.call({}, el, "This is an example value", { beforeAssertion, afterAssertion })
            expect(result.pass).toBe(true)
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['value', 'This is an example value'],
                options: { beforeAssertion, afterAssertion }
            })
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveElementProperty',
                expectedValue: ['value', 'This is an example value'],
                options: { beforeAssertion, afterAssertion },
                result
            })
        })

        test('assymetric passes', async () => {
            const result = await toHaveValue.call({}, el, expect.stringContaining('example value'))
            expect(result.pass).toBe(true)
        })

        test('RegExp passes', async () => {
            const result = await toHaveValue.call({}, el, /ExAmPlE/i)
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveValue.call({}, el, "webdriver")
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have property value')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example value')
            })
        })
    })

    describe('failure with RegExp', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveValue.call({}, el, /WDIO/)
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have property value')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/WDIO/')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example value')
            })
        })
    })
})
