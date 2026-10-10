import { describe, expect, test, vi } from 'vitest'
import { expect as wdioExpect } from '../../src/index.js'
import { toHaveText } from '../../src/matchers/element/toHaveText.js'
import { toHaveHTML } from '../../src/matchers/element/toHaveHTML.js'
import { toHaveComputedLabel } from '../../src/matchers/element/toHaveComputedLabel.js'
import { toHaveComputedRole } from '../../src/matchers/element/toHaveComputedRole.js'
import { toHaveAttribute } from '../../src/matchers/element/toHaveAttribute.js'
import { toHaveElementClass } from '../../src/matchers/element/toHaveElementClass.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toHaveStyle } from '../../src/matchers/element/toHaveStyle.js'
import { toHaveId } from '../../src/matchers/element/toHaveId.js'
import { toHaveValue } from '../../src/matchers/element/toHaveValue.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveClipboardText } from '../../src/matchers/browser/toHaveClipboardText.js'
import { toHaveLocalStorageItem } from '../../src/matchers/browser/toHaveLocalStorageItem.js'
import { browserFactory, elementFactory } from '../__mocks__/@wdio/globals.js'
import type { StringOptions } from '../../src/publicTypes/options.js'

vi.mock('@wdio/globals')

type Options = StringOptions & { ignoreCase: true, wait: 0 }

/**
 * The hooks get the expected value that the user gave, also when the string options change it for the compare
 * (`expect.oneOf()` with `ignoreCase`): `afterAssertion` gets the same value as `beforeAssertion`.
 */
describe('the expected value given to the assertion hooks', () => {
    const element = elementFactory('sel')
    const browser = browserFactory()

    const matchers: [string, (expected: unknown, options: Options) => Promise<unknown>][] = [
        ['toHaveText', (expected, options) => toHaveText.call({}, element, expected as never, options)],
        ['toHaveHTML', (expected, options) => toHaveHTML.call({}, element, expected as never, options)],
        ['toHaveComputedLabel', (expected, options) => toHaveComputedLabel.call({}, element, expected as never, options)],
        ['toHaveComputedRole', (expected, options) => toHaveComputedRole.call({}, element, expected as never, options)],
        ['toHaveAttribute', (expected, options) => toHaveAttribute.call({}, element as never, 'name', expected as never, options)],
        ['toHaveElementClass', (expected, options) => toHaveElementClass.call({}, element, expected as never, options)],
        ['toHaveElementProperty', (expected, options) => toHaveElementProperty.call({}, element as never, 'name', expected as never, options)],
        ['toHaveStyle', (expected, options) => toHaveStyle.call({}, element as never, { color: expected } as never, options)],
        ['toHaveTitle', (expected, options) => toHaveTitle.call({} as never, browser as never, expected as never, options)],
        ['toHaveUrl', (expected, options) => toHaveUrl.call({} as never, browser as never, expected as never, options)],
        ['toHaveClipboardText', (expected, options) => toHaveClipboardText.call({} as never, browser as never, expected as never, options)],
        ['toHaveLocalStorageItem', (expected, options) => toHaveLocalStorageItem.call({} as never, browser as never, 'key', expected as never, options)],
    ]

    test.each(matchers)('%s', async (_name, run) => {
        const expected = wdioExpect.oneOf('x', 'Hello')
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        await run(expected, { ignoreCase: true, wait: 0, beforeAssertion, afterAssertion })

        const [[before]] = beforeAssertion.mock.calls
        const [[after]] = afterAssertion.mock.calls
        // The same objects: `toEqual` would compare the `expect.oneOf()` asymmetrically
        const parts = (value: unknown) => [value].flat().flatMap((part) => typeof part === 'object' && part !== null && 'color' in part ? [part, part.color] : [part])
        parts(after.expectedValue).forEach((part, index) => expect(part).toBe(parts(before.expectedValue)[index]))
        expect(parts(after.expectedValue)).toContain(expected)
    })
})

/**
 * The hooks get the value of the user, not the internal arguments: a fixed argument of the getter (the `'value'` property of
 * `toHaveValue`, as the `'id'` attribute of `toHaveId`), or the `expect.anything()` of a matcher called with no value.
 */
describe('the hooks get no internal argument', () => {
    const element = elementFactory('sel')

    test.each([
        { name: 'toHaveId', run: (options: StringOptions) => toHaveId.call({}, element as never, 'Hello', options), expectedValue: 'Hello' },
        { name: 'toHaveValue', run: (options: StringOptions) => toHaveValue.call({}, element as never, 'Hello', options), expectedValue: 'Hello' },
        { name: 'toHaveAttribute with no value', run: (options: StringOptions) => toHaveAttribute.call({}, element as never, 'name', undefined as never, options), expectedValue: ['name', undefined] },
        { name: 'toHaveElementProperty with no value', run: (options: StringOptions) => toHaveElementProperty.call({}, element as never, 'name', undefined as never, options), expectedValue: ['name', undefined] },
    ])('$name', async ({ run, expectedValue }) => {
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        await run({ wait: 0, beforeAssertion, afterAssertion })

        expect(beforeAssertion.mock.calls[0][0].expectedValue).toEqual(expectedValue)
        expect(afterAssertion.mock.calls[0][0].expectedValue).toEqual(expectedValue)
    })
})
