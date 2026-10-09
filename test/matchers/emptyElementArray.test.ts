import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { toHaveText } from '../../src/matchers/element/toHaveText.js'
import { toHaveHTML } from '../../src/matchers/element/toHaveHTML.js'
import { toHaveComputedLabel } from '../../src/matchers/element/toHaveComputedLabel.js'
import { toHaveComputedRole } from '../../src/matchers/element/toHaveComputedRole.js'
import { toHaveAttribute } from '../../src/matchers/element/toHaveAttribute.js'
import { toHaveElementClass } from '../../src/matchers/element/toHaveElementClass.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toHaveStyle } from '../../src/matchers/element/toHaveStyle.js'
import { toHaveWidth } from '../../src/matchers/element/toHaveWidth.js'
import { toHaveHeight } from '../../src/matchers/element/toHaveHeight.js'
import { toHaveSize } from '../../src/matchers/element/toHaveSize.js'
import { toHaveChildren } from '../../src/matchers/element/toHaveChildren.js'
import { elementArrayFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

type Run = (context: { isNot?: boolean }, elements: WebdriverIO.ElementArray) => Promise<{ pass: boolean, message: () => string }>

/**
 * An empty `$$()` fails, and its message shows the expected value in an array: a `$$()` expects a list of values, as for
 * a `$$()` with elements.
 */
describe('the failure message of an empty $$()', () => {
    const matchers: [string, Run, string][] = [
        ['toHaveText', (context, elements) => toHaveText.call(context, elements as never, 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveHTML', (context, elements) => toHaveHTML.call(context, elements as never, 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveComputedLabel', (context, elements) => toHaveComputedLabel.call(context, elements as never, 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveComputedRole', (context, elements) => toHaveComputedRole.call(context, elements as never, 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveAttribute', (context, elements) => toHaveAttribute.call(context, elements as never, 'name', 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveElementClass', (context, elements) => toHaveElementClass.call(context, elements as never, 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveElementProperty', (context, elements) => toHaveElementProperty.call(context, elements as never, 'name', 'Hello', { wait: 0 }), '["Hello"]'],
        ['toHaveStyle', (context, elements) => toHaveStyle.call(context, elements as never, { color: 'red' } as never, { wait: 0 }), '[{"color": "red"}]'],
        ['toHaveWidth', (context, elements) => toHaveWidth.call(context, elements as never, 50, { wait: 0 }), '[50]'],
        ['toHaveHeight', (context, elements) => toHaveHeight.call(context, elements as never, 50, { wait: 0 }), '[50]'],
        ['toHaveSize', (context, elements) => toHaveSize.call(context, elements as never, { width: 50, height: 50 } as never, { wait: 0 }), '[{"height": 50, "width": 50}]'],
        ['toHaveChildren', (context, elements) => toHaveChildren.call(context, elements as never, 2, { wait: 0 }), '[2]'],
    ]

    test.each(matchers)('%s', async (_name, run, expected) => {
        const result = await run({}, elementArrayFactory('sel', 0))
        const notResult = await run({ isNot: true }, elementArrayFactory('sel', 0))

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toContain(`Expected: ${expected}\nReceived: undefined`)
        expect(notResult.pass).toBe(true) // a failure: `.not` inverts it later
        expect(stripAnsi(notResult.message())).toContain(`Expected [not]: ${expected}\nReceived      : undefined`)
    })
})
