import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { toHaveValue } from '../../../src/matchers/element/toHaveValue.js'
import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'
import type { AssertionResult } from 'expect-webdriverio'
import stripAnsi from 'strip-ansi'
import { waitUntil } from '../../../src/utils.js'
import { browserFactory, createMultiRemoteElementMock } from '../../__mocks__/@wdio/globals.js'
import { multiRemote } from '../../../src/api/index.js'

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
                expect(waitUntil).toHaveBeenCalledWith(expect.any(Function), undefined, { wait: 0, interval: undefined })
                expect(beforeAssertion).toHaveBeenCalledWith({
                    // matcherName: 'toHaveValue', // TODO fix later?
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['value', 'This is an example value'],
                    options: { beforeAssertion, afterAssertion, wait: 0 }
                })
                expect(afterAssertion).toHaveBeenCalledWith({
                    // matcherName: 'toHaveValue', // TODO fix later?
                    matcherName: 'toHaveElementProperty',
                    expectedValue: ['value', 'This is an example value'],
                    options: { beforeAssertion, afterAssertion, wait: 0 },
                    result
                })
            })

            test('assymetric passes', async () => {
                const result = await thisContext.toHaveValue(el, expect.stringContaining('example value'))

                expect(result.pass).toBe(true)
            })

            test('RegExp passes', async () => {
                const result = await thisContext.toHaveValue(el, /ExAmPlE/i)

                expect(result.pass).toBe(true)
            })
        })

        describe('failure', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveValue(el, 'webdriver')
            })

            test('does not pass with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property value

Expected: "webdriver"
Received: "This is an example value"`
                )
            })

            test('should not pass with array of strings', async () => {
                // @ts-expect-error testing invalid input
                const result = await thisContext.toHaveValue(el, ['webdriver', 'example'])
                expect(result.pass).toBe(false)
            })
        })

        describe('failure with RegExp', () => {
            let result: AssertionResult

            beforeEach(async () => {
                result = await thisContext.toHaveValue(el, /WDIO/)
            })

            test('does not pass with proper failure message', () => {
                expect(result.pass).toBe(false)
                expect(stripAnsi(result.message())).toEqual(`\
Expect $(\`sel\`) to have property value

Expected: /WDIO/
Received: "This is an example value"`
                )
            })
        })
    })
})

describe('toHaveValue on multi-remote elements', () => {
    const multiRemoteElement = () => {
        const element = createMultiRemoteElementMock({ chrome: browserFactory(), firefox: browserFactory() }, 'input')
        vi.mocked(element.getInstance('chrome').getProperty).mockResolvedValue('A')
        vi.mocked(element.getInstance('firefox').getProperty).mockResolvedValue('B')
        return element
    }

    test('passes with one value per instance, as the plain object shorthand or expect.multiRemote()', async () => {
        const withPlainObject = await toHaveValue.call({}, multiRemoteElement(), { chrome: 'A', firefox: 'B' }, { wait: 0 })
        const withMatcher = await toHaveValue.call({}, multiRemoteElement(), multiRemote({ chrome: 'A', firefox: 'B' }), { wait: 0 })

        expect(withPlainObject.pass).toBe(true)
        expect(withMatcher.pass).toBe(true)
    })

    test('fails when an instance has another value', async () => {
        const result = await toHaveValue.call({}, multiRemoteElement(), { chrome: 'A', firefox: 'A' }, { wait: 0 })

        expect(result.pass).toBe(false)
    })

    test('does not change toHaveElementProperty, where a plain object stays a literal property value', async () => {
        const result = await toHaveElementProperty.call({}, multiRemoteElement() as unknown as WebdriverIO.Element, 'value', { chrome: 'A', firefox: 'B' } as unknown as string, { wait: 0 })

        expect(result.pass).toBe(false)
    })
})
