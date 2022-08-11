import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils'
import { toHaveValue } from '../../../src/matchers/element/toHaveValue'

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
            const result = await toHaveValue(el, "This is an example value")
            expect(result.pass).toBe(true)
        })

        test('RegExp passes', async () => {
            const result = await toHaveValue(el, /ExAmPlE/i)
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveValue(el, "webdriver")
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
            result = await toHaveValue(el, /WDIO/)
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
