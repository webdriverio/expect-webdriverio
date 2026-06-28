import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute'
import stripAnsi from 'strip-ansi'

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

                // TODO: to bring back later with a subsequent PR
                //expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 3, interval: 3 })
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

                expect(result.pass).toBe(true)
            })

            test('success when present by passing undefined value with options - deprecated', async () => {
                const result = await thisContext.toHaveAttribute(el, 'attribute_name', undefined,  { wait: 1, interval: 1 })

                expect(result.pass).toBe(true)
            })

            test('not - failure when present for %s - pass should be true', async () => {
                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            })

            describe('message shows correctly', () => {
                test('expect message', async () => {
                    vi.mocked(el.getAttribute).mockResolvedValue(null as unknown as string)

                    const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                    expect(result.pass).toBe(false)
                    expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute attribute_name

Expected: true
Received: false`
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

            test.for([
                undefined,
                null
            ])('not - failure when present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
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

        describe('attribute does not exist or does not have a value', () => {
            test.for([
                undefined,
                null
            ])('failure when not present for %s', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisContext.toHaveAttribute(el, 'attribute_name')

                expect(result.pass).toBe(false)
            })

            test.for([
                undefined,
                null
            ])('failure when not present for %s', async ( attributeValue) => {
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
            ])('not - success when not present for %s - pass should be false', async ( attributeValue) => {
                vi.mocked(el.getAttribute).mockResolvedValue(attributeValue as unknown as string)

                const result = await thisIsNotContext.toHaveAttribute(el, 'attribute_name', undefined)

                expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
            })
        })
    })
})
