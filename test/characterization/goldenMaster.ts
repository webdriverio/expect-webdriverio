import { vi, type Mock } from 'vitest'
import { stringify } from 'jest-matcher-utils'
import stripAnsi from 'strip-ansi'
import { expect as wdioExpect } from '../../src/index.js'
import { some } from '../../src/api/index.js'
import {
    $Factory, browserFactory, browsingContextFactory, chainableElementArrayFactory, createMultiRemoteElementArrayMock,
    createMultiRemoteElementMock, elementArrayFactory, elementFactory, multiRemoteBrowserFactory,
} from '../__mocks__/@wdio/globals.js'

/**
 * The helpers of the golden masters (`*.golden.test.ts`): the subjects, their mocked getters, and `record()`, which runs
 * one case through the real `expect` and describes all that it did. Each test file calls `vi.mock('@wdio/globals')`.
 */

export type Subject = { name: string, build: (getter: string, values: unknown[]) => { subject: unknown, mocks: Mock[] } }
export type Options = Record<string, unknown>

/** Mock the getter of a target, which gives `value`, and keep the mock to read its calls */
export const mockGetter = (target: Record<string, unknown>, getter: string, value: unknown | (() => unknown), mocks: Mock[]) => {
    const mock = vi.mocked(target[getter] as (...args: unknown[]) => unknown)
    mock.mockImplementation(async (...args: unknown[]) => {
        const actual = typeof value === 'function' ? (value as () => unknown)() : value
        if (getter === 'execute') {
            return runInFakePage(args, actual)
        }
        // The cookies with the name of the filter (`getCookies({ name })`): none for `null`
        if (getter === 'getCookies') {
            const [{ name }] = args as [{ name: string }]
            return actual === null ? [] : [{ name, value: actual }]
        }
        // A style: the value of each CSS property, as WebdriverIO gives it (`getCSSProperty('color')`)
        if (getter === 'getCSSProperty') {
            const [property] = args as [string]
            return { property, value: (actual as Record<string, unknown>)[property] }
        }
        return actual
    })
    mocks.push(mock as unknown as Mock)
}

/**
 * `execute()` runs the script of the matcher in a fake page, where the clipboard and the local storage item `key` give
 * the value: a script that reads something else, or another item, gives another result.
 */
const runInFakePage = ([script, ...args]: unknown[], value: unknown) => {
    vi.stubGlobal('window', { navigator: { clipboard: { readText: async () => value } } })
    vi.stubGlobal('localStorage', { getItem: (key: string) => key === 'key' ? value : null })
    try {
        // The script reads the fakes before it returns: a multi-remote browser runs it on each instance at the same time
        return (script as (...args: unknown[]) => unknown)(...args)
    } finally {
        vi.unstubAllGlobals()
    }
}

export const browsers = () => ({ chrome: browserFactory(), firefox: browserFactory() })

/** A `$$()` of `length` elements: as on a page that does not change, a re-fetch of a retry finds the same elements */
export const elementArray = (length: number) => {
    const elements = elementArrayFactory('sel', length)
    elements.parent.$$ = vi.fn().mockReturnValue(elements) as never
    return elements
}

export const elementSubjects: Subject[] = [
    { name: '$()', build: (getter, values) => { const mocks: Mock[] = []; const el = elementFactory('sel'); mockGetter(el as never, getter, values[0], mocks); return { subject: el, mocks } } },
    { name: 'not awaited $()', build: (getter, values) => { const mocks: Mock[] = []; const el = elementFactory('sel'); mockGetter(el as never, getter, values[0], mocks); return { subject: $Factory(el), mocks } } },
    { name: '$$()', build: (getter, values) => { const mocks: Mock[] = []; const els = elementArray(2); els.forEach((el, i) => mockGetter(el as never, getter, values[i], mocks)); return { subject: els, mocks } } },
    { name: 'empty $$()', build: () => ({ subject: elementArray(0), mocks: [] }) },
    { name: 'some($$())', build: (getter, values) => { const mocks: Mock[] = []; const els = elementArray(2); els.forEach((el, i) => mockGetter(el as never, getter, values[i], mocks)); return { subject: some(els), mocks } } },
    { name: 'not awaited $$()', build: (getter, values) => { const mocks: Mock[] = []; const els = chainableElementArrayFactory('sel', 2); [0, 1].forEach((i) => mockGetter((els as unknown as Record<number, never>)[i], getter, values[i], mocks)); return { subject: els, mocks } } },
    { name: 'multi-remote $()', build: (getter, values) => { const mocks: Mock[] = []; const el = createMultiRemoteElementMock(browsers(), 'sel'); ['chrome', 'firefox'].forEach((name, i) => mockGetter(el.getInstance(name) as never, getter, values[i], mocks)); return { subject: el, mocks } } },
    { name: 'multi-remote $$()', build: (getter, values) => { const mocks: Mock[] = []; const els = createMultiRemoteElementArrayMock(browsers(), 'sel', 2); els.forEach((el, i) => ['chrome', 'firefox'].forEach((name) => mockGetter(el.getInstance(name) as never, getter, values[i], mocks))); return { subject: els, mocks } } },
]

export const browserSubjects: Subject[] = [
    { name: 'browser', build: (getter, values) => { const mocks: Mock[] = []; const browser = browserFactory(); mockGetter(browser as never, getter, values[0], mocks); return { subject: browser, mocks } } },
    { name: 'window', build: (getter, values) => { const mocks: Mock[] = []; const context = browsingContextFactory(); mockGetter(context as never, getter, values[0], mocks); return { subject: context, mocks } } },
    { name: 'frame', build: (getter, values) => { const mocks: Mock[] = []; const context = browsingContextFactory({ isFrame: true }); mockGetter(context as never, getter, values[0], mocks); return { subject: context, mocks } } },
    { name: 'multi-remote browser', build: (getter, values) => { const mocks: Mock[] = []; const instances = browsers(); mockGetter(instances.chrome as never, getter, values[0], mocks); mockGetter(instances.firefox as never, getter, values[1], mocks); return { subject: multiRemoteBrowserFactory(instances), mocks } } },
]

/** Run one case through the real `expect`, and describe all that it did */
export const record = async (title: string, mocks: Mock[], run: (options: Options) => unknown, options: Options) => {
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

export const matcherOf = (subject: unknown, isNot: boolean) => {
    const assertion = wdioExpect(subject as WebdriverIO.Element)
    return (isNot ? assertion.not : assertion) as unknown as Record<string, (...args: unknown[]) => Promise<void>>
}
