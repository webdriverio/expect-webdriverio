import { describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../src/index.js'
import { toHaveText } from '../../src/matchers/element/toHaveText.js'
import { toHaveHTML } from '../../src/matchers/element/toHaveHTML.js'
import { toHaveAttribute } from '../../src/matchers/element/toHaveAttribute.js'
import { toHaveId } from '../../src/matchers/element/toHaveId.js'
import { toHaveHref, toHaveLink } from '../../src/matchers/element/toHaveHref.js'
import { toHaveElementProperty } from '../../src/matchers/element/toHaveElementProperty.js'
import { toHaveValue } from '../../src/matchers/element/toHaveValue.js'
import { toHaveComputedLabel } from '../../src/matchers/element/toHaveComputedLabel.js'
import { toHaveComputedRole } from '../../src/matchers/element/toHaveComputedRole.js'
import { toHaveStyle } from '../../src/matchers/element/toHaveStyle.js'
import { toHaveElementClass } from '../../src/matchers/element/toHaveElementClass.js'
import { toHaveTitle } from '../../src/matchers/browser/toHaveTitle.js'
import { toHaveUrl } from '../../src/matchers/browser/toHaveUrl.js'
import { toHaveClipboardText } from '../../src/matchers/browser/toHaveClipboardText.js'
import { toHaveLocalStorageItem } from '../../src/matchers/browser/toHaveLocalStorageItem.js'
import { toHaveWidth } from '../../src/matchers/element/toHaveWidth.js'
import { toHaveHeight } from '../../src/matchers/element/toHaveHeight.js'
import { toHaveChildren } from '../../src/matchers/element/toHaveChildren.js'
import { toHaveSize } from '../../src/matchers/element/toHaveSize.js'
import { toBeElementsArrayOfSize } from '../../src/matchers/elements/toBeElementsArrayOfSize.js'
import { toBeRequestedTimes } from '../../src/matchers/mock/toBeRequestedTimes.js'
import { browserFactory, chainableElementArrayFactory, elementArrayFactory, setWdioKind } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

type Result = { pass: boolean, message: () => string }
type Outcome = { result: string, message: string }

/** The received part of a failure message: the `Received` line, or the `+` lines of a diff (not its `+ Received` header) */
const receivedPart = (message: string) => message.split('\n').filter((line) => line.startsWith('Received') || (line.startsWith('+') && !line.startsWith('+ Received'))).join('\n')

const outcome = async (run: () => Promise<Result>): Promise<Outcome> => {
    try {
        const { pass, message } = await run()
        return { result: pass ? 'pass' : 'fail', message: stripAnsi(message()) }
    } catch (error) {
        return { result: `throws ${(error as Error).message.replace(/Received: .*/, '')}`, message: '' }
    }
}

/**
 * Each matcher of one value type compares the same way: for each input, it gives the same result as the reference
 * matcher, with and without `.not`. A difference is a gap between the compare functions.
 */
describe('the string matchers compare each value the same way', () => {
    const element = () => elementArrayFactory('sel', 1)[0]
    type Matcher = { name: string, run: (actual: string, expected: unknown, options: object, isNot: boolean) => Promise<Result>, perClass?: true }
    const matchers: Matcher[] = [
        { name: 'toHaveText', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getText).mockResolvedValue(actual); return toHaveText.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveHTML', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getHTML).mockResolvedValue(actual as never); return toHaveHTML.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveAttribute', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getAttribute).mockResolvedValue(actual as never); return toHaveAttribute.call({ isNot }, el as never, 'data-x', expected as never, options) } },
        { name: 'toHaveId', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getAttribute).mockResolvedValue(actual as never); return toHaveId.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveHref', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getAttribute).mockResolvedValue(actual as never); return toHaveHref.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveLink', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getAttribute).mockResolvedValue(actual as never); return toHaveLink.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveElementProperty', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getProperty).mockResolvedValue(actual as never); return toHaveElementProperty.call({ isNot }, el as never, 'p', expected as never, options) } },
        { name: 'toHaveValue', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getProperty).mockResolvedValue(actual as never); return toHaveValue.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveComputedLabel', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getComputedLabel).mockResolvedValue(actual); return toHaveComputedLabel.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveComputedRole', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getComputedRole).mockResolvedValue(actual); return toHaveComputedRole.call({ isNot }, el as never, expected as never, options) } },
        { name: 'toHaveStyle', run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getCSSProperty).mockResolvedValue({ property: 'display', value: actual, parsed: {} } as never); return toHaveStyle.call({ isNot }, el as never, { display: expected } as never, options) } },
        { name: 'toHaveTitle', run: (actual, expected, options, isNot) => { const browser = browserFactory(); vi.mocked(browser.getTitle).mockResolvedValue(actual); return toHaveTitle.call({ isNot }, browser as never, expected as never, options) } },
        { name: 'toHaveUrl', run: (actual, expected, options, isNot) => { const browser = browserFactory(); vi.mocked(browser.getUrl).mockResolvedValue(actual); return toHaveUrl.call({ isNot }, browser as never, expected as never, options) } },
        { name: 'toHaveClipboardText', run: (actual, expected, options, isNot) => { const browser = browserFactory(); vi.mocked(browser.execute).mockResolvedValue(actual); return toHaveClipboardText.call({ isNot }, browser as never, expected as never, options) } },
        { name: 'toHaveLocalStorageItem', run: (actual, expected, options, isNot) => { const browser = browserFactory(); vi.mocked(browser.execute).mockResolvedValue(actual); return toHaveLocalStorageItem.call({ isNot }, browser as never, 'key', expected as never, options) } },
        // Compares each class (#2325): only the values that are one class, with no space
        { name: 'toHaveElementClass', perClass: true, run: (actual, expected, options, isNot) => { const el = element(); vi.mocked(el.getAttribute).mockResolvedValue(actual as never); return toHaveElementClass.call({ isNot }, el as never, expected as never, options) } },
    ]
    const actuals = ['Hello', '  Hello  ', 'Hello World', 'HelloWorld']
    const expectedValues: Record<string, () => unknown> = {
        'Hello': () => 'Hello', 'hello': () => 'hello', 'Hello World': () => 'Hello World', 'World': () => 'World', '/ello/': () => /ello/, '/^hello/': () => /^hello/,
        'stringContaining(ELL)': () => wdioExpect.stringContaining('ELL'), 'stringMatching(/^H/)': () => wdioExpect.stringMatching(/^H/),
        'oneOf(x, hello)': () => wdioExpect.oneOf('x', 'hello'), 'not.stringContaining(xyz)': () => wdioExpect.not.stringContaining('xyz'),
    }
    const options: Record<string, object> = {
        'none': {}, 'ignoreCase': { ignoreCase: true }, 'trim: false': { trim: false }, 'containing': { containing: true }, 'atStart': { atStart: true },
        'atEnd': { atEnd: true }, 'atIndex: 1': { atIndex: 1 }, 'replace': { replace: ['World', 'There'] }, 'replace RegExp and function': { replace: [/l+/g, (match: string) => match.toUpperCase()] },
        'ignoreCase and containing': { ignoreCase: true, containing: true }, 'replace and atEnd': { replace: ['World', 'There'], atEnd: true },
    }

    test('each matcher gives the result of toHaveText, and its message shows the actual value as is', async () => {
        const differences: string[] = []
        let compared = 0
        for (const actual of actuals) {
            for (const [expectedName, expected] of Object.entries(expectedValues)) {
                for (const [optionsName, option] of Object.entries(options)) {
                    for (const isNot of [false, true]) {
                        const input = `actual ${JSON.stringify(actual)}, expected ${expectedName}, ${optionsName}${isNot ? ', .not' : ''}`
                        const reference = await outcome(() => matchers[0].run(actual, expected(), { wait: 0, ...option }, isNot))
                        for (const matcher of matchers.slice(1)) {
                            if (matcher.perClass && (/\s/.test(actual) || optionsName === 'trim: false')) {
                                continue
                            }
                            const { result, message } = await outcome(() => matcher.run(actual, expected(), { wait: 0, ...option }, isNot))
                            compared++
                            if (result !== reference.result) {
                                differences.push(`${matcher.name}: ${result} (toHaveText: ${reference.result}) for ${input}`)
                            } else if (result === (isNot ? 'pass' : 'fail') && !receivedPart(message).includes(JSON.stringify(actual))) {
                                differences.push(`${matcher.name}: the received part of the message does not show ${JSON.stringify(actual)} for ${input}`)
                            }
                        }
                    }
                }
            }
        }

        expect(compared).toBeGreaterThan(10_000)
        expect(differences).toEqual([])
    }, 120_000)

    // With `.not` and an equal value, the expected part also shows the value: the received part must show it too
    test.each(matchers.map(({ name, run }) => ({ name, run })))('$name shows the actual value in the received part, also when it equals the expected value', async ({ run }) => {
        const { message } = await outcome(() => run('Hello', 'Hello', { wait: 0 }, true))

        expect(receivedPart(message)).toContain('"Hello"')
        expect(receivedPart(message)).not.toBe('')
    })

    // A sample of the reference, written by hand, so that all the matchers cannot agree on a wrong result
    test.each([
        { actual: '  Hello  ', expected: 'hello', options: { ignoreCase: true }, pass: true },
        { actual: '  Hello  ', expected: 'Hello', options: { trim: false }, pass: false },
        { actual: 'Hello World', expected: 'World', options: { atEnd: true }, pass: true },
        { actual: 'Hello World', expected: 'ello', options: { atIndex: 1 }, pass: true },
        { actual: 'Hello World', expected: 'Hello There', options: { replace: ['World', 'There'] }, pass: true },
        { actual: 'Hello', expected: /^hello/, options: { ignoreCase: true }, pass: true },
        { actual: 'Hello', expected: 'Hello World', options: { containing: true }, pass: false },
    ])('the reference: $actual with $expected and $options passes: $pass', async ({ actual, expected, options, pass }) => {
        const el = elementArrayFactory('sel', 1)[0]
        vi.mocked(el.getText).mockResolvedValue(actual)

        expect((await toHaveText.call({}, el, expected as never, { wait: 0, ...options } as never)).pass).toBe(pass)
    })
})

describe('the number matchers compare each value the same way', () => {
    type Matcher = { name: string, run: (actual: number, expected: unknown, isNot: boolean) => Promise<Result> }
    const matchers: Matcher[] = [
        { name: 'toHaveWidth', run: (actual, expected, isNot) => { const el = elementArrayFactory('sel', 1)[0]; vi.mocked(el.getSize).mockResolvedValue(actual as never); return toHaveWidth.call({ isNot }, el as never, expected as never, { wait: 0 }) } },
        { name: 'toHaveHeight', run: (actual, expected, isNot) => { const el = elementArrayFactory('sel', 1)[0]; vi.mocked(el.getSize).mockResolvedValue(actual as never); return toHaveHeight.call({ isNot }, el as never, expected as never, { wait: 0 }) } },
        { name: 'toHaveChildren', run: (actual, expected, isNot) => { const el = elementArrayFactory('sel', 1)[0]; vi.mocked(el.$$).mockReturnValue(chainableElementArrayFactory('./*', actual)); return toHaveChildren.call({ isNot }, el as never, expected as never, { wait: 0 }) } },
        { name: 'toBeElementsArrayOfSize', run: (actual, expected, isNot) => toBeElementsArrayOfSize.call({ isNot }, elementArrayFactory('sel', actual) as never, expected as never, { wait: 0 }) },
        { name: 'toBeRequestedTimes', run: (actual, expected, isNot) => toBeRequestedTimes.call({ isNot }, setWdioKind({ calls: Array(actual).fill({}) }, 'mock') as never, expected as never, { wait: 0 }) },
        { name: 'toHaveSize, on a field', run: (actual, expected, isNot) => { const el = elementArrayFactory('sel', 1)[0]; vi.mocked(el.getSize).mockResolvedValue({ width: actual, height: 1 } as never); return toHaveSize.call({ isNot }, el as never, { width: expected, height: 1 } as never, { wait: 0 }) } },
    ]
    const expectedValues: Record<string, (actual: number) => unknown> = {
        'the number': (actual) => actual, 'another number': (actual) => actual + 1, '{ eq }': (actual) => ({ eq: actual }), '{ gte } below': (actual) => ({ gte: actual - 1 }),
        '{ gte } above': (actual) => ({ gte: actual + 1 }), '{ lte }': (actual) => ({ lte: actual }), '{ gte, lte } around': (actual) => ({ gte: actual - 1, lte: actual + 1 }),
        'oneOf with it': (actual) => wdioExpect.oneOf(actual + 5, actual), 'oneOf without it': (actual) => wdioExpect.oneOf(actual + 5, actual + 6),
        'invalid {}': () => ({}), 'invalid { foo }': () => ({ foo: 1 }), 'invalid range': () => ({ gte: 5, lte: 1 }), 'invalid string': (actual) => String(actual),
        'invalid NaN': () => NaN, 'invalid oneOf of strings': (actual) => wdioExpect.oneOf(String(actual)), 'invalid empty oneOf': () => wdioExpect.oneOf(),
        'closeTo near': (actual) => wdioExpect.closeTo(actual + 0.2, 0), 'closeTo far': (actual) => wdioExpect.closeTo(actual + 2, 0),
        'not.closeTo': (actual) => wdioExpect.not.closeTo(actual, 0), 'any(Number)': () => wdioExpect.any(Number), 'invalid list matcher': (actual) => wdioExpect.arrayContaining([actual]),
    }

    test('each matcher gives the result of toHaveWidth', async () => {
        const differences: string[] = []
        for (const actual of [1, 2, 3]) {
            for (const [expectedName, expected] of Object.entries(expectedValues)) {
                for (const isNot of [false, true]) {
                    const reference = await outcome(() => matchers[0].run(actual, expected(actual), isNot))
                    for (const matcher of matchers.slice(1)) {
                        const { result } = await outcome(() => matcher.run(actual, expected(actual), isNot))
                        if (result !== reference.result) {
                            differences.push(`${matcher.name}: ${result} (toHaveWidth: ${reference.result}) for ${actual}, ${expectedName}${isNot ? ', .not' : ''}`)
                        }
                    }
                }
            }
        }

        expect(differences).toEqual([])
    })

    // A sample of the reference, written by hand, so that all the matchers cannot agree on a wrong result
    test.each([
        { expected: 2, result: 'pass' },
        { expected: { gte: 1, lte: 3 }, result: 'pass' },
        { expected: { gte: 3 }, result: 'fail' },
        { expected: wdioExpect.oneOf(1, 2), result: 'pass' },
        { expected: wdioExpect.oneOf(1, 3), result: 'fail' },
        { expected: {}, result: 'throws Invalid NumberMatcher. ' },
        { expected: '2', result: 'throws Invalid NumberMatcher. ' },
        { expected: wdioExpect.closeTo(2.2, 0), result: 'pass' },
        { expected: wdioExpect.closeTo(4, 0), result: 'fail' },
        { expected: wdioExpect.arrayContaining([2]), result: 'throws Invalid NumberMatcher. ' },
    ])('the reference: a width of 2 with $expected: $result', async ({ expected, result }) => {
        expect((await outcome(() => matchers[0].run(2, expected, false))).result).toBe(result)
    })
})
