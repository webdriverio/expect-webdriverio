import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute.js'

vi.mock('@wdio/globals')

describe('toHaveAttribute', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
    })

    describe('attribute exists', () => {
        test('success when present', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name")
            expect(result.pass).toBe(true)
        })

        test('failure when not present', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return null
            })
            const result = await toHaveAttribute(el, "attribute_name")
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = vi.fn().mockImplementation(() => {
                    return null
                })
                result = await toHaveAttribute(el, "attribute_name")
            })
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('true')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('false')
            })
        })
    })

    describe('attribute has value', () => {
        test('success with correct value', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true })
            expect(result.pass).toBe(true)
        })
        test('success with RegExp and correct value', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", /cOrReCt VaLuE/i)
            expect(result.pass).toBe(true)
        })
        test('failure with wrong value', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "Wrong Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true })
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as actual', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return 123
            })
            const result = await toHaveAttribute(el, "attribute_name", "Correct Value", { ignoreCase: true })
            expect(result.pass).toBe(false)
        })
        test('failure with non-string attribute value as expected', async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "Correct Value"
            })
            const result = await toHaveAttribute(el, "attribute_name", 123, { ignoreCase: true })
            expect(result.pass).toBe(false)
        })
        describe('message shows correctly', () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = vi.fn().mockImplementation(() => {
                    return "Wrong"
                })
                result = await toHaveAttribute(el, "attribute_name", "Correct")
            })
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('Correct')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('Wrong')
            })
        })
        describe('failure with RegExp, message shows correctly', () => {
            let result: any

            beforeEach(async () => {
                el.getAttribute = vi.fn().mockImplementation(() => {
                    return "Wrong"
                })
                result = await toHaveAttribute(el, "attribute_name", /WDIO/)
            })
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/WDIO/')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('Wrong')
            })
        })
    })
})
