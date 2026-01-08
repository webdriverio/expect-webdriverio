import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveValue } from '../../../src/matchers/element/toHaveValue.js'
import type { AssertionResult } from 'expect-webdriverio'

vi.mock('@wdio/globals')

describe(toHaveValue, () => {

    let thisContext: { toHaveValue: typeof toHaveValue }

    beforeEach(() => {
        thisContext = { toHaveValue }
    })

    describe('given single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getProperty).mockResolvedValue('This is an example value')
        })

        describe('success', () => {
            test('exact passes', async () => {
                const beforeAssertion = vi.fn()
                const afterAssertion = vi.fn()

                const result = await thisContext.toHaveValue(el, 'This is an example value', { wait: 0, beforeAssertion, afterAssertion })

                expect(result.pass).toBe(true)
                expect(beforeAssertion).toBeCalledWith({
                    matcherName: 'toHaveValue',
                    expectedValue: ['value', 'This is an example value'],
                    options: { beforeAssertion, afterAssertion, wait: 0 }
                })
                expect(afterAssertion).toBeCalledWith({
                    matcherName: 'toHaveValue',
                    expectedValue: ['value', 'This is an example value'],
                    options: { beforeAssertion, afterAssertion, wait: 0 },
                    result
                })
            })

            test('assymetric passes', async () => {
                const result = await thisContext.toHaveValue(el, expect.stringContaining('example value'), { wait: 0 })

                expect(result.pass).toBe(true)
            })

            test('RegExp passes', async () => {
                const result = await thisContext.toHaveValue(el, /ExAmPlE/i, { wait: 0 })

                expect(result.pass).toBe(true)
            })
        })

        describe('failure', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveValue(el, 'webdriver', { wait: 0 })
            })

            test('does not pass with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have property value

Expected: "webdriver"
Received: "This is an example value"`
                )
            })
        })

        describe('failure with RegExp', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveValue(el, /WDIO/, { wait: 0 })
            })

            test('does not pass with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(result.message()).toEqual(`\
Expect $(\`sel\`) to have property value

Expected: /WDIO/
Received: "This is an example value"`
                )
            })
        })
    })
})
