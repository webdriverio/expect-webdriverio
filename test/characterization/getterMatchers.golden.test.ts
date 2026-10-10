import { afterEach, describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect, SoftAssertService } from '../../src/index.js'
import { multiRemote } from '../../src/api/index.js'
import { browserSubjects, elementSubjects, matcherOf, record, type Options } from './goldenMaster.js'

vi.mock('@wdio/globals')

/**
 * Golden master of the matchers that the generic factory of the RFC (step 3) will make: it records today's behavior
 * through the real `expect`, and each change of the factory must keep these files the same. For each case: the result,
 * the failure message, the calls of the `beforeAssertion` and `afterAssertion` hooks, and the calls of the getter.
 *
 * A change here is a change of behavior: review it, and update the files with `vitest -u` only when it is wanted.
 */

afterEach(() => {
    vi.useRealTimers()
})

describe('golden master of the getter matchers', () => {
    const stringValues: Record<string, string[]> = { 'Hello, World': ['Hello', 'World'], '"  hello  ", Hello': ['  hello  ', 'Hello'] }
    const stringExpected: Record<string, () => unknown> = {
        '"Hello"': () => 'Hello', '"hello"': () => 'hello', '/^Hel/': () => /^Hel/, 'stringContaining("ell")': () => wdioExpect.stringContaining('ell'),
        'oneOf("x", "Hello")': () => wdioExpect.oneOf('x', 'Hello'), '["Hello", "World"]': () => ['Hello', 'World'], 'arrayContaining(["Hello"])': () => wdioExpect.arrayContaining(['Hello']),
        'multiRemote({ chrome: "Hello", firefox: "World" })': () => multiRemote({ chrome: 'Hello', firefox: 'World' }), '{ chrome: "Hello", firefox: "World" }': () => ({ chrome: 'Hello', firefox: 'World' }),
    }
    const stringOptions: Record<string, Options> = { 'no option': {}, 'ignoreCase': { ignoreCase: true }, 'containing': { containing: true } }

    test('element string matchers', async () => {
        const matchers = [
            { name: 'toHaveText', getter: 'getText', options: stringOptions },
            { name: 'toHaveHTML', getter: 'getHTML', options: { ...stringOptions, 'includeSelectorTag: false': { includeSelectorTag: false } } },
            { name: 'toHaveComputedLabel', getter: 'getComputedLabel', options: stringOptions },
            { name: 'toHaveComputedRole', getter: 'getComputedRole', options: stringOptions },
        ]
        const output: string[] = []
        for (const { name, getter, options } of matchers) {
            for (const { name: subjectName, build } of elementSubjects) {
                for (const [valuesName, values] of Object.entries(stringValues)) {
                    for (const [expectedName, expected] of Object.entries(stringExpected)) {
                        for (const [optionsName, option] of Object.entries(options)) {
                            for (const isNot of [false, true]) {
                                const { subject, mocks } = build(getter, values)
                                output.push(await record(`${name} | ${subjectName} | values ${valuesName} | ${isNot ? '.not ' : ''}${expectedName} | ${optionsName}`, mocks, (o) => matcherOf(subject, isNot)[name](expected(), o), option))
                            }
                        }
                    }
                }
            }
        }

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/element-string-matchers.txt')
    }, 300_000)

    test('browser string matchers', async () => {
        const matchers = [
            { name: 'toHaveTitle', getter: 'getTitle', args: [] },
            { name: 'toHaveUrl', getter: 'getUrl', args: [] },
            { name: 'toHaveClipboardText', getter: 'execute', args: [] },
            { name: 'toHaveLocalStorageItem', getter: 'execute', args: ['key'] },
        ]
        const expectedValues = Object.fromEntries(Object.entries(stringExpected).filter(([name]) => !name.startsWith('arrayContaining')))
        const output: string[] = []
        for (const { name, getter, args } of matchers) {
            for (const { name: subjectName, build } of browserSubjects) {
                for (const [valuesName, values] of Object.entries(stringValues)) {
                    for (const [expectedName, expected] of Object.entries(expectedValues)) {
                        for (const [optionsName, option] of Object.entries(stringOptions)) {
                            for (const isNot of [false, true]) {
                                const { subject, mocks } = build(getter, values)
                                output.push(await record(`${name} | ${subjectName} | values ${valuesName} | ${isNot ? '.not ' : ''}${expectedName} | ${optionsName}`, mocks, (o) => matcherOf(subject, isNot)[name](...args, expected(), o), option))
                            }
                        }
                    }
                }
            }
        }

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/browser-string-matchers.txt')
    }, 300_000)

    test('boolean matchers', async () => {
        const matchers = [
            { name: 'toBeDisplayed', getter: 'isDisplayed', options: { 'no option': {}, 'withinViewport': { withinViewport: true }, 'contentVisibilityAuto: false': { contentVisibilityAuto: false } } },
            { name: 'toBeDisplayedInViewport', getter: 'isDisplayed' },
            { name: 'toBeClickable', getter: 'isClickable' },
            { name: 'toBeEnabled', getter: 'isEnabled' },
            { name: 'toBeDisabled', getter: 'isEnabled' },
            { name: 'toBeFocused', getter: 'isFocused' },
            { name: 'toBeSelected', getter: 'isSelected' },
            { name: 'toBeChecked', getter: 'isSelected' },
            { name: 'toBeExisting', getter: 'isExisting' },
            { name: 'toExist', getter: 'isExisting' },
            { name: 'toBePresent', getter: 'isExisting' },
        ]
        const booleanValues: Record<string, boolean[]> = { 'true, true': [true, true], 'false, false': [false, false], 'true, false': [true, false] }
        const output: string[] = []
        for (const { name, getter, options = { 'no option': {} } } of matchers) {
            for (const { name: subjectName, build } of elementSubjects) {
                for (const [valuesName, values] of Object.entries(booleanValues)) {
                    for (const [optionsName, option] of Object.entries(options)) {
                        for (const isNot of [false, true]) {
                            const { subject, mocks } = build(getter, values)
                            output.push(await record(`${name} | ${subjectName} | values ${valuesName} | ${isNot ? '.not' : 'positive'} | ${optionsName}`, mocks, (o) => matcherOf(subject, isNot)[name](o), option))
                        }
                    }
                }
            }
        }

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/boolean-matchers.txt')
    }, 300_000)

    test('retries with a wait: the tries and the time', async () => {
        // [matcher, getter, expected arguments, the wrong value, the right value]
        const matchers: [string, string, unknown[], unknown, unknown][] = [
            ['toHaveText', 'getText', ['Hello'], 'Other', 'Hello'], ['toHaveHTML', 'getHTML', ['Hello'], 'Other', 'Hello'],
            ['toHaveComputedLabel', 'getComputedLabel', ['Hello'], 'Other', 'Hello'], ['toHaveComputedRole', 'getComputedRole', ['Hello'], 'Other', 'Hello'],
            ['toBeDisplayed', 'isDisplayed', [], false, true], ['toBeClickable', 'isClickable', [], false, true], ['toBeDisabled', 'isEnabled', [], true, false],
            ['toExist', 'isExisting', [], false, true],
            ['toHaveTitle', 'getTitle', ['Hello'], 'Other', 'Hello'], ['toHaveUrl', 'getUrl', ['Hello'], 'Other', 'Hello'], ['toHaveClipboardText', 'execute', ['Hello'], 'Other', 'Hello'],
            ['toHaveLocalStorageItem', 'execute', ['key', 'Hello'], 'Other', 'Hello'],
        ]
        const output: string[] = []
        for (const [name, getter, args, wrong, right] of matchers) {
            const subjects = name.startsWith('toHaveTitle') || name.startsWith('toHaveUrl') || name.startsWith('toHaveClipboard') || name.startsWith('toHaveLocalStorage') ? browserSubjects.filter((s) => s.name !== 'frame') : elementSubjects.filter((s) => ['$()', '$$()', 'multi-remote $()'].includes(s.name))
            for (const { name: subjectName, build } of subjects) {
                // With `.not`, the value that the matcher must not find is the expected value
                for (const [scenario, wait, wrongTries, isNot] of [
                    ['right on the 3rd try', 1000, 2, false], ['always wrong', 300, Infinity, false],
                    ['.not, right on the 3rd try', 1000, 2, true], ['.not, always wrong', 300, Infinity, true],
                ] as const) {
                    vi.useFakeTimers()
                    const [wrongValue, rightValue] = isNot ? [right, wrong] : [wrong, right]
                    // Each element or instance counts its own tries
                    const valueOf = () => { let tries = 0; return () => ++tries <= wrongTries ? wrongValue : rightValue }
                    const { subject, mocks } = build(getter, [valueOf(), valueOf()])
                    const start = Date.now()
                    const [line] = await Promise.all([
                        record(`${name} | ${subjectName} | ${scenario} | wait ${wait}, interval 100`, mocks, (o) => matcherOf(subject, isNot)[name](...args, o), { wait, interval: 100 }),
                        vi.runAllTimersAsync(),
                    ])
                    output.push(`${line.trimEnd()}\ntime: ${Date.now() - start} ms\n`)
                    vi.useRealTimers()
                }
            }
        }

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/retries.txt')
    }, 300_000)

    test('soft assertions', async () => {
        const service = SoftAssertService.getInstance()
        service.setCurrentTest('golden', 'golden master', 'getterMatchers.golden.test.ts')
        const output: string[] = []
        for (const [name, getter, args, value, browserMatcher] of [
            ['toHaveText', 'getText', ['Other'], 'Hello', false], ['toHaveHTML', 'getHTML', ['Other'], 'Hello', false],
            ['toHaveComputedLabel', 'getComputedLabel', ['Other'], 'Hello', false], ['toHaveComputedRole', 'getComputedRole', ['Other'], 'Hello', false],
            ['toBeDisplayed', 'isDisplayed', [], false, false], ['toExist', 'isExisting', [], false, false], ['toBeChecked', 'isSelected', [], false, false],
            ['toHaveTitle', 'getTitle', ['Other'], 'Hello', true], ['toHaveUrl', 'getUrl', ['Other'], 'Hello', true],
        ] as const) {
            const { subject } = (browserMatcher ? browserSubjects[0] : elementSubjects[0]).build(getter, [value, value])
            await (wdioExpect.soft(subject as never) as unknown as Record<string, (...a: unknown[]) => Promise<void>>)[name](...args, { wait: 0 })
            const failures = service.getFailures('golden')
            output.push(`### ${name} | soft\n${failures.map((failure) => `${failure.matcherName}:\n${stripAnsi(failure.error.message).split('\n').map((line) => `  ${line}`).join('\n')}`).join('\n')}\n`)
            service.clearFailures('golden')
        }
        service.clearCurrentTest()

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/soft-assertions.txt')
    })
})
