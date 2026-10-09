import { afterEach, describe, expect, test, vi, type Mock } from 'vitest'
import { stringify } from 'jest-matcher-utils'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect, SoftAssertService } from '../../src/index.js'
import { multiRemote, some } from '../../src/api/index.js'
import {
    $Factory, browserFactory, browsingContextFactory, chainableElementArrayFactory, createMultiRemoteElementArrayMock,
    createMultiRemoteElementMock, elementArrayFactory, elementFactory, multiRemoteBrowserFactory,
} from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

/**
 * Golden master of the matchers that the generic factory of the RFC (step 3) will make: it records today's behavior
 * through the real `expect`, and each change of the factory must keep these files the same. For each case: the result,
 * the failure message, the calls of the `beforeAssertion` and `afterAssertion` hooks, and the calls of the getter.
 *
 * A change here is a change of behavior: review it, and update the files with `vitest -u` only when it is wanted.
 */

type Subject = { name: string, build: (getter: string, values: unknown[]) => { subject: unknown, mocks: Mock[] } }
type Options = Record<string, unknown>

/** Mock the getter of a target, which gives `value`, and keep the mock to read its calls */
const mockGetter = (target: Record<string, unknown>, getter: string, value: unknown | (() => unknown), mocks: Mock[]) => {
    const mock = vi.mocked(target[getter] as (...args: unknown[]) => unknown)
    mock.mockImplementation(async () => typeof value === 'function' ? (value as () => unknown)() : value)
    mocks.push(mock as unknown as Mock)
}

const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

/** A `$$()` of `length` elements: as on a page that does not change, a re-fetch of a retry finds the same elements */
const elementArray = (length: number) => {
    const elements = elementArrayFactory('sel', length)
    elements.parent.$$ = vi.fn().mockReturnValue(elements) as never
    return elements
}

const elementSubjects: Subject[] = [
    { name: '$()', build: (getter, values) => { const mocks: Mock[] = []; const el = elementFactory('sel'); mockGetter(el as never, getter, values[0], mocks); return { subject: el, mocks } } },
    { name: 'not awaited $()', build: (getter, values) => { const mocks: Mock[] = []; const el = elementFactory('sel'); mockGetter(el as never, getter, values[0], mocks); return { subject: $Factory(el), mocks } } },
    { name: '$$()', build: (getter, values) => { const mocks: Mock[] = []; const els = elementArray(2); els.forEach((el, i) => mockGetter(el as never, getter, values[i], mocks)); return { subject: els, mocks } } },
    { name: 'empty $$()', build: () => ({ subject: elementArray(0), mocks: [] }) },
    { name: 'some($$())', build: (getter, values) => { const mocks: Mock[] = []; const els = elementArray(2); els.forEach((el, i) => mockGetter(el as never, getter, values[i], mocks)); return { subject: some(els), mocks } } },
    { name: 'not awaited $$()', build: (getter, values) => { const mocks: Mock[] = []; const els = chainableElementArrayFactory('sel', 2); [0, 1].forEach((i) => mockGetter((els as unknown as Record<number, never>)[i], getter, values[i], mocks)); return { subject: els, mocks } } },
    { name: 'multi-remote $()', build: (getter, values) => { const mocks: Mock[] = []; const el = createMultiRemoteElementMock(browsers(), 'sel'); ['chrome', 'firefox'].forEach((name, i) => mockGetter(el.getInstance(name) as never, getter, values[i], mocks)); return { subject: el, mocks } } },
    { name: 'multi-remote $$()', build: (getter, values) => { const mocks: Mock[] = []; const els = createMultiRemoteElementArrayMock(browsers(), 'sel', 2); els.forEach((el, i) => ['chrome', 'firefox'].forEach((name) => mockGetter(el.getInstance(name) as never, getter, values[i], mocks))); return { subject: els, mocks } } },
]

const browserSubjects: Subject[] = [
    { name: 'browser', build: (getter, values) => { const mocks: Mock[] = []; const browser = browserFactory(); mockGetter(browser as never, getter, values[0], mocks); return { subject: browser, mocks } } },
    { name: 'window', build: (getter, values) => { const mocks: Mock[] = []; const context = browsingContextFactory(); mockGetter(context as never, getter, values[0], mocks); return { subject: context, mocks } } },
    { name: 'frame', build: (getter, values) => { const mocks: Mock[] = []; const context = browsingContextFactory({ isFrame: true }); mockGetter(context as never, getter, values[0], mocks); return { subject: context, mocks } } },
    { name: 'multi-remote browser', build: (getter, values) => { const mocks: Mock[] = []; const instances = browsers(); mockGetter(instances.chrome as never, getter, values[0], mocks); mockGetter(instances.firefox as never, getter, values[1], mocks); return { subject: multiRemoteBrowserFactory(instances), mocks } } },
]

/** Run one case through the real `expect`, and describe all that it did */
const record = async (title: string, mocks: Mock[], run: (options: Options) => unknown, options: Options) => {
    const beforeAssertion = vi.fn()
    const afterAssertion = vi.fn()
    let result: string
    let message = ''
    try {
        await run({ wait: 0, ...options, beforeAssertion, afterAssertion })
        result = 'passes'
    } catch (error) {
        const { name, message: text } = error as Error
        result = 'matcherResult' in (error as object) ? 'fails' : `throws ${name}: ${stripAnsi(text).split('\n')[0]}`
        message = 'matcherResult' in (error as object) ? stripAnsi(text) : ''
    }
    const hook = (calls: unknown[][], withResult: boolean) => calls.map(([params]) => {
        const { matcherName, expectedValue, options: hookOptions, result: hookResult } = params as { matcherName: string, expectedValue: unknown, options: object, result?: { pass: boolean } }
        return `${matcherName} expected=${stringify(expectedValue)} options=[${Object.keys(hookOptions).sort().join(',')}]${withResult ? ` pass=${hookResult?.pass}` : ''}`
    }).join(' ; ') || '-'
    const getterCalls = mocks.flatMap((mock) => mock.mock.calls.map((args) => stringify(args)))
    const counted = [...new Set(getterCalls)].map((args) => `${args} x${getterCalls.filter((call) => call === args).length}`).join(', ') || '-'
    return [
        `### ${title}`,
        `result: ${result}`,
        `before: ${hook(beforeAssertion.mock.calls, false)}`,
        `after: ${hook(afterAssertion.mock.calls, true)}`,
        `getter calls: ${counted}`,
        ...(message ? ['message:', ...message.split('\n').map((line) => `  ${line}`)] : []),
        '',
    ].join('\n')
}

const matcherOf = (subject: unknown, isNot: boolean) => {
    const assertion = wdioExpect(subject as WebdriverIO.Element)
    return (isNot ? assertion.not : assertion) as unknown as Record<string, (...args: unknown[]) => Promise<void>>
}

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
        ]
        const output: string[] = []
        for (const [name, getter, args, wrong, right] of matchers) {
            const subjects = name.startsWith('toHaveTitle') || name.startsWith('toHaveUrl') || name.startsWith('toHaveClipboard') ? browserSubjects.filter((s) => s.name !== 'frame') : elementSubjects.filter((s) => ['$()', '$$()', 'multi-remote $()'].includes(s.name))
            for (const { name: subjectName, build } of subjects) {
                for (const [scenario, wait, wrongTries] of [['right on the 3rd try', 1000, 2], ['always wrong', 300, Infinity]] as const) {
                    vi.useFakeTimers()
                    // Each element or instance counts its own tries
                    const valueOf = () => { let tries = 0; return () => ++tries <= wrongTries ? wrong : right }
                    const { subject, mocks } = build(getter, [valueOf(), valueOf()])
                    const start = Date.now()
                    const [line] = await Promise.all([
                        record(`${name} | ${subjectName} | ${scenario} | wait ${wait}, interval 100`, mocks, (o) => matcherOf(subject, false)[name](...args, o), { wait, interval: 100 }),
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
