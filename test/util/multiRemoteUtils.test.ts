import { vi, test, describe, expect } from 'vitest'

import { getElementsPerInstance, hasSameInstanceNames, isBrowser, isPerInstanceValues } from '../../src/util/multiRemoteUtils.js'
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

    describe(isPerInstanceValues, () => {
        const instances = ['chrome', 'firefox']

        test('treats any plain object as per-instance values by default, even with only unknown names', () => {
            expect(isPerInstanceValues({ safari: 'a' }, instances)).toBe(true)
        })

        test('requires an instance name when the expected value itself can be an object', () => {
            expect(isPerInstanceValues({ color: 'red' }, instances, { allowObjectExpectedValue: true })).toBe(false)
            expect(isPerInstanceValues({ chrome: { color: 'red' } }, instances, { allowObjectExpectedValue: true })).toBe(true)
        })

        test.each(['a', ['a'], /a/, expect.stringContaining('a'), undefined])('is false for %s', (value) => {
            expect(isPerInstanceValues(value, instances)).toBe(false)
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
