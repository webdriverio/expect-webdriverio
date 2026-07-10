import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute'
import stripAnsi from 'strip-ansi'
import { waitUntil } from '../../../src/util/waitUntil.js'

vi.mock('@wdio/globals')

describe(toHaveAttribute, () => {
    let thisContext: { toHaveAttribute: typeof toHaveAttribute }
    let thisIsNotContext: { isNot: boolean, toHaveAttribute: typeof toHaveAttribute }

    beforeEach(() => {
        thisContext = { toHaveAttribute }
        thisIsNotContext = { isNot: true, toHaveAttribute }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockResolvedValue('Correct Value')
        })

        describe('attribute exists', () => {
            test('success when present', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', { beforeAssertion, afterAssertion, wait: 3, interval: 3 })

                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 3, interval: 3 })
                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion, wait: 3, interval: 3 }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveAttribute',
                    expectedValue: ['attribute_name', undefined],
                    options: { beforeAssertion, afterAssertion, wait: 3, interval: 3 },
                    result
                })
            })

            test('success when present by passing undefined value - deprecated', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 20, interval: 1 })
                expect(result.pass).toBe(true)
            })

            test('success when present by passing undefined value with options - deprecated', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined,  { wait: 0 })

                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0 })
                expect(result.pass).toBe(true)
            })

            test('success when checking with asymmetric matcher', async () => {
                // Casting since we use vitest asymmetrics matcher instead of wdio one and TypeScript show a deprecation
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', expect.stringContaining('Correct') as AsymmetricMatcher<string>)

                expect(result.pass).toBe(true)
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: "to have a defined value"
Received: "value null"`
                    )
                })
            })
        })

        describe('attribute has value', () => {
            test('success with correct value', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(true)
            })

            test('success with RegExp and correct value', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', /cOrReCt VaLuE/i)

                expect(result.pass).toBe(true)
            })

            test('failure with wrong value', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue('Wrong Value')

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            test('failure with non-string attribute value as actual', async () => {
                vi.mocked(el.getAttribute).mockResolvedValue(123 as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct Value', { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            test('failure with non-string attribute value as expected', async () => {
                // @ts-expect-error invalid type
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', 123, { ignoreCase: true, wait: 1 })

                expect(result.pass).toBe(false)
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong')

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', 'Correct')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: "Correct"
Received: "Wrong"`
                    )
                })
            })

            describe('failure with RegExp, message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue('Wrong')

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name', /WDIO/)

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: /WDIO/
Received: "Wrong"`
                    )
                })
            })
        })

        describe('given attribute existence', () => {
            test.for([
                undefined,
                null
            ])('failure when not present (not expected value) for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: "to have a defined value"
Received: "value ${attributeValue}"`
                )
            })

            test.for([
                undefined,
                null
            ])('failure when not present (not expected value but with options) for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', { wait: 1, interval: 1 })

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('failure when not present with undefined expected value for %s - deprecated', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test.for([
                undefined,
                null
            ])('not - success when not present with undefined expected value for %s - pass should be false -- deprecated', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })

            test('not - failure when present for %s - pass should be true', async () => {
                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have attribute attribute_name

Expected [not]: "to have a defined value"
Received      : "value Correct Value"`
                )
            })
        })
    })
})
