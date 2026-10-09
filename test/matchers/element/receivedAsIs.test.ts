import { describe, expect, test, vi } from 'vitest'
import { INVERTED_COLOR } from 'jest-matcher-utils'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { elementArrayFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')
vi.mock('jest-matcher-utils', async (importActual) => {
    const actual = await importActual<typeof import('jest-matcher-utils')>()
    return { ...actual, INVERTED_COLOR: vi.fn(actual.INVERTED_COLOR) }
})

type NotAssertion = (expectation: { not: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray> }, options: ExpectWebdriverIO.StringOptions) => Promise<void>
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

/**
 * With `.not` on `$$()`, an element that matched only because of the string options is highlighted with its value as
 * is: the highlight follows the verdict of the matcher (#2334), not an `equals()` of the value that the message shows.
 */
describe.each([
    { name: 'toHaveAttribute', getter: 'getAttribute', assert: ((e, o) => e.not.toHaveAttribute('data-x', ['foo', 'bar'], o)) as NotAssertion },
    { name: 'toHaveElementProperty', getter: 'getProperty', assert: ((e, o) => e.not.toHaveElementProperty('value', ['foo', 'bar'], o)) as NotAssertion },
] as const)('$name with .not highlights the element that matched, with its value as is', ({ getter, assert }) => {
    test('with the default trim', async () => {
        const elements = elementArrayFactory('items', 2)
        vi.mocked(elements[0][getter]).mockResolvedValue('  foo  ' as never)
        vi.mocked(elements[1][getter]).mockResolvedValue('other' as never)

        await expect(assert(wdioExpect(elements) as never, { wait: 0 })).rejects.toThrow()
        expect(vi.mocked(INVERTED_COLOR).mock.calls.map(([value]) => value)).toEqual(['trimmed<"foo">', '"  foo  "'])
    })
})
