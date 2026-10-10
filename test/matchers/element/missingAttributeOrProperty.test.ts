import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../../src/index.js'
import { toHaveAttribute } from '../../../src/matchers/element/toHaveAttribute.js'
import { toHaveId } from '../../../src/matchers/element/toHaveId.js'
import { toHaveElementClass } from '../../../src/matchers/element/toHaveElementClass.js'
import { toHaveElementProperty } from '../../../src/matchers/element/toHaveElementProperty.js'
import { toHaveValue } from '../../../src/matchers/element/toHaveValue.js'
import { elementArrayFactory, elementFactory } from '../../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

type Result = Promise<{ pass: boolean, message: () => string }>

/**
 * A missing attribute or property (`null`) never matches, also not a matcher that accepts no value, as a missing cookie
 * or localStorage item: the assertion waits for the value. The message shows `no attribute` or `no property`, not `null`.
 */
describe('a missing attribute or property', () => {
    const missing = (getter: 'getAttribute' | 'getProperty') => {
        const element = elementFactory('sel')
        vi.mocked(element[getter]).mockResolvedValue(null as never)
        return element
    }
    const matchers: [string, 'getAttribute' | 'getProperty', string, (context: Record<string, unknown>, element: WebdriverIO.Element, expected: unknown) => Result][] = [
        ['toHaveAttribute', 'getAttribute', 'no attribute', (context, element, expected) => toHaveAttribute.call(context, element as never, 'name', expected, { wait: 0 })],
        ['toHaveId', 'getAttribute', 'no attribute', (context, element, expected) => toHaveId.call(context, element as never, expected as never, { wait: 0 })],
        ['toHaveElementClass', 'getAttribute', 'no attribute', (context, element, expected) => toHaveElementClass.call(context, element as never, expected as never, { wait: 0 })],
        ['toHaveElementProperty', 'getProperty', 'no property', (context, element, expected) => toHaveElementProperty.call(context, element as never, 'name', expected, { wait: 0 })],
        ['toHaveValue', 'getProperty', 'no property', (context, element, expected) => toHaveValue.call(context, element as never, expected as never, { wait: 0 })],
    ]

    describe.each(matchers)('%s', (_name, getter, text, run) => {
        test('never matches, also not a matcher that accepts no value', async () => {
            expect((await run({}, missing(getter), 'Hello')).pass).toBe(false)
            expect((await run({}, missing(getter), wdioExpect.anything())).pass).toBe(false)
            expect((await run({}, missing(getter), wdioExpect.not.stringContaining('x'))).pass).toBe(false)
            // `.not`: Jest inverts the result later
            expect((await run({ isNot: true }, missing(getter), 'Hello')).pass).toBe(false)
        })

        test(`shows ${text} in the message`, async () => {
            expect(stripAnsi((await run({}, missing(getter), 'Hello')).message())).toContain(`Expected: "Hello"\nReceived: ${text}`)
        })
    })

    test('shows the text for each element of $$()', async () => {
        const elements = elementArrayFactory('sel', 2)
        vi.mocked(elements[0].getAttribute).mockResolvedValue('Hello' as never)
        vi.mocked(elements[1].getAttribute).mockResolvedValue(null as never)

        const result = await toHaveAttribute.call({}, elements as never, 'name', 'Hello', { wait: 0 })

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toContain('+   no attribute,')
    })
})
