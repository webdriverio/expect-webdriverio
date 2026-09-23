import { vi, test, describe, expect, afterEach } from 'vitest'

import { getElementsPerInstance, getGlobalMultiRemoteInstanceNames, getPerInstanceValues, hasSameInstanceNames, isBrowser, isMultiRemoteMatcher } from '../../src/util/multiRemoteUtils.js'
import { multiRemote } from '../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, multiRemoteBrowserFactory } from '../__mocks__/@wdio/globals.js'
import { isElementArrayLike } from '../../src/util/elementsUtil.js'

vi.mock('@wdio/globals')

/** Same as `@wdio/globals`: a proxy over an empty class, binding every function it returns (`constructor` included) */
const wdioGlobalsProxy = <T extends object>(receiver: T): T => new Proxy(class Browser {}, {
    get: (_target, prop) => {
        const field = (receiver as Record<string | symbol, unknown>)[prop]
        return typeof field === 'function' ? field.bind(receiver) : field
    }
}) as unknown as T

describe('multiRemoteUtils', () => {
    describe(isBrowser, () => {
        test.each([
            { name: 'browser', browser: () => browserFactory() },
            { name: 'multi-remote browser', browser: () => multiRemoteBrowserFactory() },
            { name: '@wdio/globals browser proxy', browser: () => wdioGlobalsProxy(browserFactory()) },
            { name: '@wdio/globals multi-remote browser proxy', browser: () => wdioGlobalsProxy(multiRemoteBrowserFactory()) },
        ])('recognizes a $name', ({ browser }) => {
            expect(isBrowser(browser())).toBe(true)
        })

        test.each([undefined, null, {}, 'browser', Object.create(null)])('does not recognize %s', (value) => {
            expect(isBrowser(value)).toBe(false)
        })
    })

    describe(getPerInstanceValues, () => {
        test('treats any plain object as per-instance values by default, even with only unknown names', () => {
            expect(getPerInstanceValues({ safari: 'a' })).toEqual({ safari: 'a' })
        })

        test('always unwraps expect.multiRemote()', () => {
            expect(getPerInstanceValues(multiRemote({ chrome: 'a', firefox: 'b' }))).toEqual({ chrome: 'a', firefox: 'b' })
            expect(getPerInstanceValues(multiRemote({ chrome: { color: 'red' } }), { allowObjectExpectedValue: true })).toEqual({ chrome: { color: 'red' } })
        })

        test('keeps a plain object as a literal when the expected value itself can be an object, whatever its keys', () => {
            expect(getPerInstanceValues({ color: 'red' }, { allowObjectExpectedValue: true })).toBeUndefined()
            // e.g. instances named `width` and `height` with `toHaveSize({ width, height })`
            expect(getPerInstanceValues({ width: 10, height: 20 }, { allowObjectExpectedValue: true })).toBeUndefined()
        })

        test.each(['a', ['a'], /a/, expect.stringContaining('a'), undefined])('is undefined for %s', (value) => {
            expect(getPerInstanceValues(value)).toBeUndefined()
        })
    })

    test(isMultiRemoteMatcher, () => {
        expect(isMultiRemoteMatcher(multiRemote({ chrome: 'a' }))).toBe(true)
        expect(isMultiRemoteMatcher({ chrome: 'a' })).toBe(false)
        expect(isMultiRemoteMatcher(expect.anything())).toBe(false)
        expect(isMultiRemoteMatcher(undefined)).toBe(false)
    })

    describe(getGlobalMultiRemoteInstanceNames, () => {
        afterEach(() => {
            vi.unstubAllGlobals()
        })

        test('returns the instances of the global multiRemoteBrowser', () => {
            vi.stubGlobal('multiRemoteBrowser', multiRemoteBrowserFactory())

            expect(getGlobalMultiRemoteInstanceNames()).toEqual(['chrome', 'firefox'])
        })

        test('returns undefined without the global multiRemoteBrowser', () => {
            expect(getGlobalMultiRemoteInstanceNames()).toBeUndefined()
        })

        test('returns undefined when the @wdio/globals proxy has no registered browser', () => {
            vi.stubGlobal('multiRemoteBrowser', new Proxy({}, { get: () => { throw new Error('No browser instance registered') } }))

            expect(getGlobalMultiRemoteInstanceNames()).toBeUndefined()
        })
    })

    test(hasSameInstanceNames, () => {
        expect(hasSameInstanceNames({ firefox: 1, chrome: 1 }, ['chrome', 'firefox'])).toBe(true)
        expect(hasSameInstanceNames({ chrome: 1 }, ['chrome', 'firefox'])).toBe(false)
        expect(hasSameInstanceNames({ chrome: 1, safari: 1 }, ['chrome', 'firefox'])).toBe(false)
    })

    describe(getElementsPerInstance, () => {
        test('splits zipped elements back per instance, skipping the missing trailing ones', () => {
            const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel', 2) as unknown as WebdriverIO.MultiRemoteElement[]
            const last = elements[1]
            const getInstance = last.getInstance.bind(last)
            last.getInstance = ((name: string) => {
                if (name === 'firefox') {
                    throw new Error('Multiremote object has no instance named "firefox"')
                }
                return getInstance(name)
            }) as WebdriverIO.MultiRemoteElement['getInstance']

            const perInstance = getElementsPerInstance(elements, ['chrome', 'firefox'])

            expect(perInstance.chrome).toEqual([elements[0].getInstance('chrome'), getInstance('chrome')])
            expect(perInstance.firefox).toEqual([elements[0].getInstance('firefox')])
        })
    })

    test('isElementArrayLike is false for a MultiRemoteElementArray whose `every` is asynchronous', () => {
        process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
        try {
            const elements = createMultiRemoteElementArrayMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel', 2) as unknown as { every: unknown }
            // Like WebdriverIO's `enhanceElementsArray()`, returning a (truthy) Promise
            elements.every = async () => false

            expect(isElementArrayLike(elements)).toBe(false)
        } finally {
            delete process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY
        }
    })
})
