import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { elementArrayFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

type Assertion = (expectation: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.Element | WebdriverIO.ElementArray>, options: ExpectWebdriverIO.StringOptions) => Promise<void>

/**
 * The failure message shows the actual value as is: not trimmed, lowercased or replaced by the string options.
 */
describe.each([
    { name: 'toHaveText', getter: 'getText', assert: ((e, o) => e.toHaveText('foo', o)) as Assertion },
    { name: 'toHaveHTML', getter: 'getHTML', assert: ((e, o) => e.toHaveHTML('foo', o)) as Assertion },
    { name: 'toHaveAttribute', getter: 'getAttribute', assert: ((e, o) => e.toHaveAttribute('data-x', 'foo', o)) as Assertion },
    { name: 'toHaveElementProperty', getter: 'getProperty', assert: ((e, o) => e.toHaveElementProperty('value', 'foo', o)) as Assertion },
    { name: 'toHaveComputedLabel', getter: 'getComputedLabel', assert: ((e, o) => e.toHaveComputedLabel('foo', o)) as Assertion },
    { name: 'toHaveComputedRole', getter: 'getComputedRole', assert: ((e, o) => e.toHaveComputedRole('foo', o)) as Assertion },
] as const)('$name shows the received value as is', ({ getter, assert }) => {
    const value = '  BAR  '

    test.each([
        { name: 'trim (default)', options: {} },
        { name: 'ignoreCase', options: { ignoreCase: true } },
        { name: 'replace', options: { replace: ['A', 'X'] as [string, string] } },
    ])('with $name, on one element and on a list', async ({ options }) => {
        const elements = elementArrayFactory('items', 2)
        for (const element of elements) {
            vi.mocked(element[getter]).mockResolvedValue(value as never)
        }

        for (const subject of [elements[0], elements]) {
            const error = await assert(wdioExpect(subject), { wait: 0, ...options }).then(() => undefined, (e: Error) => e)

            expect(error).toBeInstanceOf(Error)
            expect(stripAnsi(error!.message)).toContain(`"${value}"`)
        }
    })
})
