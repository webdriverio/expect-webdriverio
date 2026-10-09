import { beforeEach, describe, expect, test, vi } from 'vitest'
import { INVERTED_COLOR } from 'jest-matcher-utils'
import { toHaveText } from '../../../src/matchers/element/toHaveText.js'
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass.js'
import { elementArrayFactory } from '../../__mocks__/@wdio/globals.js'
import { expect as wdioExpect } from '../../../src/index.js'

vi.mock('@wdio/globals')
vi.mock('jest-matcher-utils', async (importActual) => {
    const actual = await importActual<typeof import('jest-matcher-utils')>()
    return { ...actual, INVERTED_COLOR: vi.fn(actual.INVERTED_COLOR) }
})

/**
 * With `.not` on `$$()`, the failure message highlights the elements that matched (`INVERTED_COLOR`, on the expected and
 * the received side). The matcher decides which elements matched, with its string options and its own comparison.
 */
describe('.not on multiple elements highlights the elements that matched', () => {
    const thisNotContext = { isNot: true }
    const options = { wait: 0 }

    const elementsWith = (getter: 'getText' | 'getAttribute', values: string[]) => {
        const elements = elementArrayFactory('items', values.length)
        values.forEach((value, index) => vi.mocked(elements[index][getter]).mockResolvedValue(value))
        return elements
    }

    const highlighted = () => vi.mocked(INVERTED_COLOR).mock.calls.map(([value]) => value)

    beforeEach(() => {
        vi.mocked(INVERTED_COLOR).mockClear()
    })

    test('with ignoreCase', async () => {
        const result = await toHaveText.call(thisNotContext, elementsWith('getText', ['other', 'BAR']), ['foo', 'bar'], { ...options, ignoreCase: true })
        result.message()

        expect(result.pass).toBe(true) // failure, inverted later because of `.not`
        expect(highlighted()).toEqual(['"bar"', '"BAR"'])
    })

    test('with the default trim', async () => {
        const result = await toHaveText.call(thisNotContext, elementsWith('getText', ['  foo  ', 'other']), ['foo', 'bar'], options)
        result.message()

        expect(result.pass).toBe(true)
        expect(highlighted()).toEqual(['"foo"', '"  foo  "'])
    })

    test('with replace, not the element whose value is equal before the replacement', async () => {
        // `abc` becomes `aac` and does not match; `b` becomes `a` and matches
        const result = await toHaveText.call(thisNotContext, elementsWith('getText', ['abc', 'b']), ['abc', 'a'], { ...options, replace: ['b', 'a'] })
        result.message()

        expect(result.pass).toBe(true)
        expect(highlighted()).toEqual(['"a"', '"b"'])
    })

    test('with toHaveElementClass, which compares each class', async () => {
        const result = await toHaveElementClass.call(thisNotContext, elementsWith('getAttribute', ['btn active', 'other']), ['active', 'btn'], options)
        result.message()

        expect(result.pass).toBe(true)
        expect(highlighted()).toEqual(['"active"', '"btn active"'])
    })

    test.each([
        { name: 'toHaveHTML', getter: 'getHTML', assert: (e: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray>, o: ExpectWebdriverIO.StringOptions) => e.toHaveHTML(['FOO', 'BAR'], o) },
        { name: 'toHaveAttribute', getter: 'getAttribute', assert: (e: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray>, o: ExpectWebdriverIO.StringOptions) => e.toHaveAttribute('data-x', ['FOO', 'BAR'], o) },
        { name: 'toHaveComputedLabel', getter: 'getComputedLabel', assert: (e: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray>, o: ExpectWebdriverIO.StringOptions) => e.toHaveComputedLabel(['FOO', 'BAR'], o) },
        { name: 'toHaveComputedRole', getter: 'getComputedRole', assert: (e: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray>, o: ExpectWebdriverIO.StringOptions) => e.toHaveComputedRole(['FOO', 'BAR'], o) },
        { name: 'toHaveElementProperty', getter: 'getProperty', assert: (e: ExpectWebdriverIO.Matchers<Promise<void>, WebdriverIO.ElementArray>, o: ExpectWebdriverIO.StringOptions) => e.toHaveElementProperty('value', ['FOO', 'BAR'], o) },
    ] as const)('with ignoreCase in $name', async ({ getter, assert }) => {
        const elements = elementArrayFactory('items', 2)
        // A lowercase actual value: `ignoreCase` does not change it
        for (const [index, value] of ['other', 'bar'].entries()) {
            vi.mocked(elements[index][getter]).mockResolvedValue(value as never)
        }

        await expect(assert(wdioExpect(elements).not, { ...options, ignoreCase: true })).rejects.toThrow()
        expect(highlighted()).toEqual(['"BAR"', '"bar"'])
    })
})
