import { afterEach, describe, expect, test, vi } from 'vitest'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect, SoftAssertService } from '../../src/index.js'
import { multiRemote } from '../../src/api/index.js'
import { browserSubjects, elementSubjects, matcherOf, record, type Options, type Subject } from './goldenMaster.js'

vi.mock('@wdio/globals')

/**
 * Golden master of the getter matchers that step 5 of the RFC moves into the factory: the attribute, property, size and
 * style matchers. Same records as `getterMatchers.golden.test.ts`: the result, the failure message, the hook calls and
 * the getter calls with their arguments (`getAttribute('id')`, `getSize('width')`, `getCSSProperty('color')`).
 *
 * A change here is a change of behavior: review it, and update the files with `vitest -u` only when it is wanted.
 */

type Matcher = {
    name: string
    getter: string
    /** The arguments before the expected value, e.g. the attribute name of `toHaveAttribute` */
    args?: unknown[]
    /** Each entry: values of the 2 elements or instances */
    values: Record<string, unknown[]>
    expected: Record<string, () => unknown>
    options: Record<string, Options>
    /** Only these subjects, for an alias or a fixed argument that shares its code with another matcher */
    subjects?: string[]
    /** The subjects of the browser matchers (browser, window, frame, multi-remote browser) */
    browser?: true
}

/** Every combination of a matcher: subject, values, expected value, options, and `.not` */
const matrix = async (matchers: Matcher[]) => {
    const output: string[] = []
    for (const { name, getter, args = [], values, expected, options, subjects, browser } of matchers) {
        for (const { name: subjectName, build } of (browser ? browserSubjects : elementSubjects).filter((subject) => !subjects || subjects.includes(subject.name))) {
            for (const [valuesName, value] of Object.entries(values)) {
                for (const [expectedName, expectedValue] of Object.entries(expected)) {
                    for (const [optionsName, option] of Object.entries(options)) {
                        for (const isNot of [false, true]) {
                            const { subject, mocks } = build(getter, value)
                            const title = `${name}${args.length ? `(${args.map((arg) => JSON.stringify(arg)).join(', ')})` : ''} | ${subjectName} | values ${valuesName} | ${isNot ? '.not ' : ''}${expectedName} | ${optionsName}`
                            output.push(await record(title, mocks, (o) => matcherOf(subject, isNot)[name](...args, expectedValue(), o), option))
                        }
                    }
                }
            }
        }
    }
    return output.join('\n')
}

const fewSubjects = ['$()', '$$()', 'empty $$()', 'multi-remote $()']
const stringValues: Record<string, unknown[]> = { 'Hello, World': ['Hello', 'World'], '"  hello  ", Hello': ['  hello  ', 'Hello'], 'null, Hello': [null, 'Hello'] }
const stringExpected: Record<string, () => unknown> = {
    '"Hello"': () => 'Hello', '/^Hel/': () => /^Hel/, 'stringContaining("ell")': () => wdioExpect.stringContaining('ell'),
    'oneOf("x", "Hello")': () => wdioExpect.oneOf('x', 'Hello'), '["Hello", "World"]': () => ['Hello', 'World'],
    'arrayContaining(["Hello"])': () => wdioExpect.arrayContaining(['Hello']), 'anything()': () => wdioExpect.anything(),
    'multiRemote({ chrome: "Hello", firefox: "World" })': () => multiRemote({ chrome: 'Hello', firefox: 'World' }),
    '{ chrome: "Hello", firefox: "World" }': () => ({ chrome: 'Hello', firefox: 'World' }),
}
const stringOptions: Record<string, Options> = { 'no option': {}, 'ignoreCase': { ignoreCase: true }, 'containing': { containing: true } }
/** For the matchers that compare a string as `toHaveAttribute`: fewer expected values */
const mediumStringExpected = Object.fromEntries(Object.entries(stringExpected).filter(([name]) => !['stringContaining("ell")', 'anything()'].includes(name)))
const fewStringExpected = Object.fromEntries(Object.entries(stringExpected).filter(([name]) => ['"Hello"', 'oneOf("x", "Hello")', '["Hello", "World"]', 'arrayContaining(["Hello"])'].includes(name)))

afterEach(() => {
    vi.useRealTimers()
})

describe('golden master of the other getter matchers', () => {
    test('attribute matchers', async () => {
        const output = await matrix([
            { name: 'toHaveAttribute', getter: 'getAttribute', args: ['name'], values: stringValues, expected: { ...mediumStringExpected, 'anything()': () => wdioExpect.anything(), 'not.stringContaining("x")': () => wdioExpect.not.stringContaining('x') }, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
            // No expected value: the attribute exists
            { name: 'toHaveAttribute', getter: 'getAttribute', args: ['name'], values: stringValues, expected: { 'no value': () => undefined }, options: { 'no option': {} } },
            { name: 'toHaveId', getter: 'getAttribute', values: stringValues, expected: fewStringExpected, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } }, subjects: fewSubjects },
            { name: 'toHaveHref', getter: 'getAttribute', values: stringValues, expected: fewStringExpected, options: { 'no option': {} }, subjects: fewSubjects },
            { name: 'toHaveLink', getter: 'getAttribute', values: stringValues, expected: fewStringExpected, options: { 'no option': {} }, subjects: fewSubjects },
            // Each class is compared: 2 classes in one attribute, split on ASCII whitespace
            {
                name: 'toHaveElementClass', getter: 'getAttribute', values: { ...stringValues, '"btn Hello", "a\\tWorld"': ['btn Hello', 'a\tWorld'] },
                expected: mediumStringExpected, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } },
            },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/attribute-matchers.txt')
    }, 300_000)

    test('tag name matcher', async () => {
        const output = await matrix([
            { name: 'toHaveTagName', getter: 'getTagName', values: { 'button, a': ['button', 'a'], '"  BUTTON  ", button': ['  BUTTON  ', 'button'] }, expected: { '"button"': () => 'button', ...Object.fromEntries(Object.entries(mediumStringExpected).filter(([name]) => name !== '"Hello"')) }, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/tag-name-matcher.txt')
    }, 300_000)

    test('cookie matcher', async () => {
        const output = await matrix([
            { name: 'toHaveCookie', getter: 'getCookies', args: ['lang'], browser: true, values: stringValues, expected: { ...mediumStringExpected, 'anything()': () => wdioExpect.anything(), 'not.stringContaining("x")': () => wdioExpect.not.stringContaining('x') }, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
            { name: 'toHaveCookie', getter: 'getCookies', args: ['lang'], browser: true, values: stringValues, expected: { 'no value': () => undefined }, options: { 'no option': {} } },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/cookie-matcher.txt')
    }, 300_000)

    test('local storage matcher', async () => {
        const output = await matrix([
            { name: 'toHaveLocalStorageItem', getter: 'execute', args: ['key'], browser: true, values: stringValues, expected: { ...mediumStringExpected, 'anything()': () => wdioExpect.anything(), 'not.stringContaining("x")': () => wdioExpect.not.stringContaining('x') }, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
            { name: 'toHaveLocalStorageItem', getter: 'execute', args: ['key'], browser: true, values: stringValues, expected: { 'no value': () => undefined }, options: { 'no option': {} } },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/local-storage-matcher.txt')
    }, 300_000)

    test('session storage matcher', async () => {
        const output = await matrix([
            { name: 'toHaveSessionStorageItem', getter: 'execute', args: ['key'], browser: true, values: stringValues, expected: { ...mediumStringExpected, 'anything()': () => wdioExpect.anything(), 'not.stringContaining("x")': () => wdioExpect.not.stringContaining('x') }, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
            { name: 'toHaveSessionStorageItem', getter: 'execute', args: ['key'], browser: true, values: stringValues, expected: { 'no value': () => undefined }, options: { 'no option': {} } },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/session-storage-matcher.txt')
    }, 300_000)

    test('property matchers', async () => {
        const output = await matrix([
            // A string property: compared as `toHaveText`. `true`: a list matcher on `$()` compares an array property
            { name: 'toHaveElementProperty', getter: 'getProperty', args: ['name'], values: stringValues, expected: mediumStringExpected, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
            // Another value: `equals()`, or its text with `asString`
            {
                name: 'toHaveElementProperty', getter: 'getProperty', args: ['name'], subjects: fewSubjects,
                // `$()` reads the first value: an array property first, so that a list matcher can match it
                values: { '2, "2"': [2, '2'], '{ a: 1 }, ["Hello"]': [{ a: 1 }, ['Hello']], '["Hello", "World"], { a: 1 }': [['Hello', 'World'], { a: 1 }] },
                expected: {
                    '2': () => 2, '"2"': () => '2', '/^2/': () => /^2/, '{ a: 1 }': () => ({ a: 1 }), 'objectContaining({ a: 1 })': () => wdioExpect.objectContaining({ a: 1 }),
                    'arrayContaining(["Hello"])': () => wdioExpect.arrayContaining(['Hello']), 'arrayContaining(["x"])': () => wdioExpect.arrayContaining(['x']), '["Hello", "World"]': () => ['Hello', 'World'],
                },
                options: { 'no option': {}, 'asString': { asString: true } },
            },
            { name: 'toHaveElementProperty', getter: 'getProperty', args: ['name'], values: stringValues, expected: { 'no value': () => undefined }, options: { 'no option': {} }, subjects: fewSubjects },
            { name: 'toHaveValue', getter: 'getProperty', values: stringValues, expected: mediumStringExpected, options: { 'no option': {}, 'ignoreCase': { ignoreCase: true } } },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/property-matchers.txt')
    }, 300_000)

    test('size matchers', async () => {
        const numberExpected = (value: number): Record<string, () => unknown> => ({
            [`${value}`]: () => value, [`{ gte: ${value - 10} }`]: () => ({ gte: value - 10 }), [`{ gte: ${value - 10}, lte: ${value + 10} }`]: () => ({ gte: value - 10, lte: value + 10 }),
            [`oneOf(${value}, 200)`]: () => wdioExpect.oneOf(value, 200), [`closeTo(${value + 0.4}, 0)`]: () => wdioExpect.closeTo(value + 0.4, 0), 'any(Number)': () => wdioExpect.any(Number),
            [`[${value}, 150]`]: () => [value, 150], [`arrayContaining([${value}])`]: () => wdioExpect.arrayContaining([value]),
            [`multiRemote({ chrome: ${value}, firefox: 150 })`]: () => multiRemote({ chrome: value, firefox: 150 }), [`{ chrome: ${value}, firefox: 150 }`]: () => ({ chrome: value, firefox: 150 }),
            '{}': () => ({}), '"100"': () => '100',
        })
        const size = { width: 100, height: 50 }
        const output = await matrix([
            { name: 'toHaveWidth', getter: 'getSize', values: { '100, 150': [100, 150] }, expected: numberExpected(100), options: { 'no option': {} } },
            { name: 'toHaveHeight', getter: 'getSize', values: { '50, 150': [50, 150] }, expected: numberExpected(50), options: { 'no option': {} }, subjects: fewSubjects },
            {
                name: 'toHaveSize', getter: 'getSize', values: { '100x50, 150x50': [size, { width: 150, height: 50 }] },
                expected: {
                    '{ width: 100, height: 50 }': () => size, '{ width: { gte: 90 }, height: 50 }': () => ({ width: { gte: 90 }, height: 50 }),
                    '{ width: closeTo(100.4, 0), height: 50 }': () => ({ width: wdioExpect.closeTo(100.4, 0), height: 50 }),
                    'objectContaining({ width: 100 })': () => wdioExpect.objectContaining({ width: 100 }), '[100x50, 150x50]': () => [size, { width: 150, height: 50 }],
                    'arrayContaining([100x50])': () => wdioExpect.arrayContaining([size]), 'multiRemote({ chrome: 100x50, firefox: 150x50 })': () => multiRemote({ chrome: size, firefox: { width: 150, height: 50 } }),
                    '{ width: {} }': () => ({ width: {}, height: 50 }),
                },
                options: { 'no option': {} },
            },
        ])

        await expect(output).toMatchFileSnapshot('./__golden__/size-matchers.txt')
    }, 300_000)

    test('style matcher', async () => {
        const output = await matrix([{
            name: 'toHaveStyle', getter: 'getCSSProperty',
            values: { 'red block, "  RED  " block': [{ color: 'red', display: 'block' }, { color: '  RED  ', display: 'block' }], 'red block, blue block': [{ color: 'red', display: 'block' }, { color: 'blue', display: 'block' }] },
            expected: {
                '{ color: "red" }': () => ({ color: 'red' }), '{ color: "red", display: "block" }': () => ({ color: 'red', display: 'block' }), '{ color: /^re/ }': () => ({ color: /^re/ }),
                '{ color: oneOf("blue", "red") }': () => ({ color: wdioExpect.oneOf('blue', 'red') }), '[{ color: "red" }, { color: "blue" }]': () => [{ color: 'red' }, { color: 'blue' }],
                'multiRemote({ chrome: { color: "red" }, firefox: { color: "blue" } })': () => multiRemote({ chrome: { color: 'red' }, firefox: { color: 'blue' } }),
                'arrayContaining([{ color: "red" }])': () => wdioExpect.arrayContaining([{ color: 'red' }]),
            },
            options: stringOptions,
        }])

        await expect(output).toMatchFileSnapshot('./__golden__/style-matcher.txt')
    }, 300_000)

    test('retries with a wait: the tries and the time', async () => {
        // [matcher, getter, arguments, the wrong value, the right value]
        const matchers: [string, string, unknown[], unknown, unknown][] = [
            ['toHaveAttribute', 'getAttribute', ['name', 'Hello'], 'Other', 'Hello'], ['toHaveId', 'getAttribute', ['Hello'], 'Other', 'Hello'],
            ['toHaveElementClass', 'getAttribute', ['Hello'], 'Other', 'Hello'], ['toHaveElementProperty', 'getProperty', ['name', 'Hello'], 'Other', 'Hello'],
            ['toHaveValue', 'getProperty', ['Hello'], 'Other', 'Hello'], ['toHaveWidth', 'getSize', [100], 99, 100],
            ['toHaveSize', 'getSize', [{ width: 100, height: 50 }], { width: 99, height: 50 }, { width: 100, height: 50 }],
            ['toHaveStyle', 'getCSSProperty', [{ color: 'red' }], { color: 'blue' }, { color: 'red' }],
        ]
        const output: string[] = []
        for (const [name, getter, args, wrong, right] of matchers) {
            for (const { name: subjectName, build } of elementSubjects.filter((subject: Subject) => ['$()', '$$()', 'multi-remote $()'].includes(subject.name))) {
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

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/other-retries.txt')
    }, 300_000)

    test('soft assertions', async () => {
        const service = SoftAssertService.getInstance()
        service.setCurrentTest('golden', 'golden master', 'otherGetterMatchers.golden.test.ts')
        const output: string[] = []
        for (const [name, getter, args, value] of [
            ['toHaveAttribute', 'getAttribute', ['name', 'Other'], 'Hello'], ['toHaveId', 'getAttribute', ['Other'], 'Hello'], ['toHaveLink', 'getAttribute', ['Other'], 'Hello'],
            ['toHaveElementClass', 'getAttribute', ['Other'], 'Hello'], ['toHaveElementProperty', 'getProperty', ['name', 'Other'], 'Hello'], ['toHaveValue', 'getProperty', ['Other'], 'Hello'],
            ['toHaveWidth', 'getSize', [99], 100], ['toHaveSize', 'getSize', [{ width: 99, height: 50 }], { width: 100, height: 50 }], ['toHaveStyle', 'getCSSProperty', [{ color: 'blue' }], { color: 'red' }],
        ] as const) {
            const { subject } = elementSubjects[0].build(getter, [value, value])
            await (wdioExpect.soft(subject as never) as unknown as Record<string, (...a: unknown[]) => Promise<void>>)[name](...args, { wait: 0 })
            const failures = service.getFailures('golden')
            output.push(`### ${name} | soft\n${failures.map((failure) => `${failure.matcherName}:\n${stripAnsi(failure.error.message).split('\n').map((line) => `  ${line}`).join('\n')}`).join('\n')}\n`)
            service.clearFailures('golden')
        }
        service.clearCurrentTest()

        await expect(output.join('\n')).toMatchFileSnapshot('./__golden__/other-soft-assertions.txt')
    })
})
