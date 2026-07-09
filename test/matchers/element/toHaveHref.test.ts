import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveHref } from '../../../src/matchers/element/toHaveHref.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

describe(toHaveHref, () => {

    let thisContext: { 'toHaveHref': typeof toHaveHref }

    beforeEach(() => {
        thisContext = { 'toHaveHref': toHaveHref }
    })

    describe('given a single element', () => {
        let el: ChainablePromiseElement

        beforeEach(async () => {
            el = await $('sel')
            vi.mocked(el.getAttribute).mockResolvedValue('https://www.example.com')
        })

        test('success when contains', async () => {
            const beforeAssertion = vi.fn()
            const afterAssertion = vi.fn()

            const result = await thisContext.toHaveHref(el, 'https://www.example.com', { wait: 0, beforeAssertion, afterAssertion })

            expect(result.pass).toBe(true)
            expect(beforeAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHref',
                expectedValue: 'https://www.example.com',
                options: { beforeAssertion, afterAssertion, wait: 0 }
            })
            expect(afterAssertion).toHaveBeenCalledWith({
                matcherName: 'toHaveHref',
                expectedValue: 'https://www.example.com',
                options: { beforeAssertion, afterAssertion, wait: 0 },
                result
            })
        })

        describe('failure when doesnt contain', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveHref(el, 'an href')
            })

            test('failure with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have attribute href

Expected: "an href"
Received: "https://www.example.com"`
                )
            })
        })
    })
})
