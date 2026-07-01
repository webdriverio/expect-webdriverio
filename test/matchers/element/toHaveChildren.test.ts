import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveChildren } from '../../../src/matchers/element/toHaveChildren'
import { chainableElementArrayFactory } from '../../__mocks__/@wdio/globals'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toHaveChildren, () => {
    const thisContext = { toHaveChildren }
    const thisNotContext = { isNot: true, toHaveChildren }

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.$$).mockRestore()
        })

        describe('given no value', () => {

            test('no value - success - default to gte 1', async () => {
                const result = await thisContext.toHaveChildren(el)

                expect(result.pass).toBe(true)
            })

            test('no value - success - default to gte 1 with options', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveChildren(el, { wait: 0, interval: 5, beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveChildren',
                    expectedValue: undefined,
                    options: { wait: 0, interval: 5, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveChildren',
                    expectedValue: undefined,
                    options: { wait: 0, interval: 5, beforeAssertion, afterAssertion },
                    result
                })
            })

            test('no value - success - default to gte 1 (with undefined) and with command options - deprecated', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveChildren(el, undefined, { wait: 0, interval: 5, beforeAssertion, afterAssertion })

                // TODO bring back later
                // expect(waitUntil).toHaveBeenCalledExactlyOnceWith(expect.any(Function), undefined, { wait: 0, interval: 5 })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveChildren',
                    expectedValue: undefined,
                    options: { wait: 0, interval: 5, beforeAssertion, afterAssertion }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    matcherName: 'toHaveChildren',
                    expectedValue: undefined,
                    options: { wait: 0, interval: 5, beforeAssertion, afterAssertion },
                    result
                })
            })

            test('no value - success - default to gte 1 (with empty object) -- deprecated officially even if not striked', async () => {
                const result = await thisContext.toHaveChildren(el, {})

                expect(result.pass).toBe(true)
            })
        })

        test('use numberOption wait and internal and command options - deprecated', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveChildren(el, { eq: 2, wait: 0, interval: 5 }, { beforeAssertion, afterAssertion } )

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion },
                expectedValue: { eq: 2, wait: 0, interval: 5 }

            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion },
                result,
                expectedValue: { eq: 2, wait: 0, interval: 5 }
            })
        })

        test('use numberOption wait and internal wait but no command options - deprecated', async () => {
            const result = await thisContext.toHaveChildren(el, { eq: 2, wait: 0, interval: 5 } )

            expect(result.pass).toBe(true)
        })

        test('use numberMatcher and wait and internal', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveChildren(el, { eq: 2 }, { beforeAssertion, afterAssertion, wait: 0, interval: 5 } )

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion, wait: 0, interval: 5 },
                expectedValue: { eq: 2 }

            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveChildren',
                options: { beforeAssertion, afterAssertion, wait: 0, interval: 5 },
                result,
                expectedValue: { eq: 2 }
            })
        })

        test('success - If no options passed in + children exists', async () => {
            const result = await thisContext.toHaveChildren(el)

            expect(result.pass).toBe(true)
        })

        test('fails - If no options passed in + children do not exist', async () => {
            vi.mocked(el.$$).mockReturnValue(chainableElementArrayFactory('./child', 0))

            const result = await thisContext.toHaveChildren(el)

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have children

Expected: ">= 1"
Received: 0`
            )
        })

        test('exact number value', async () => {
            const result = await thisContext.toHaveChildren(el, 2)

            expect(result.pass).toBe(true)
        })

        test('exact value', async () => {
            const result = await thisContext.toHaveChildren(el, { eq: 2 })

            expect(result.pass).toBe(true)
        })

        test('gte value', async () => {
            const result = await thisContext.toHaveChildren(el, { gte: 2 })

            expect(result.pass).toBe(true)
        })

        test('exact value - failure', async () => {
            const result = await thisContext.toHaveChildren(el, { eq: 3 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have children

Expected: 3
Received: 2`
            )
        })

        test('lte value - failure', async () => {
            const result = await thisContext.toHaveChildren(el, { lte: 1 })

            expect(result.pass).toBe(false)
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have children

Expected: "<= 1"
Received: 2`
            )
        })

        test('.not, exact value - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveChildren(el, { eq: 2 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have children

Expected [not]: 2
Received      : 2`
            )
        })

        // This is not outputting the right colors in the test output console, to enhance!
        test('.not, lte value - failure - pass should be true', async () => {
            const result = await thisNotContext.toHaveChildren(el, { lte: 2 })

            expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
            expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) not to have children

Expected [not]: "<= 2"
Received      : 2`
            )
        })

        test('.not, exact value - success - pass should be false', async () => {
            const result = await thisNotContext.toHaveChildren(el, { eq: 3 })

            expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        })
    })
})
