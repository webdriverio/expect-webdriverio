import { vi, test, describe, expect, afterEach } from 'vitest'

import { getElementsPerInstance, getGlobalMultiRemoteInstanceNames, getPerInstanceValues, getMockInstanceNames, hasMultiRemoteFlag, hasSameInstanceNames, isBrowser, isMock, isMockArray, isMultiRemoteBrowser, isMultiRemoteMatcher, isMultiRemoteMock, isMultiRemoteValues } from '../../src/util/multiRemoteUtils.js'
import { multiRemote } from '../../src/api/index.js'
import { browserFactory, createMultiRemoteElementArrayMock, createMultiRemoteElementMock, multiRemoteBrowserFactory, multiRemoteMockFactory, setWdioKind } from '../__mocks__/@wdio/globals.js'

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

        test('is not a browser by its constructor name', () => {
            expect(isBrowser(new (class Browser {})())).toBe(false)
        })

        test('a browsing context is a browser subject, until #2298 decides', () => {
            expect(isBrowser(setWdioKind({}, 'browsing-context'))).toBe(true)
        })
    })

    describe(isMultiRemoteBrowser, () => {
        test('a multi-remote element is not a multi-remote browser', () => {
            const element = createMultiRemoteElementMock({ chrome: browserFactory(), firefox: browserFactory() }, 'sel')

            expect(isMultiRemoteBrowser(element as unknown as WebdriverIO.MultiRemoteBrowser)).toBe(false)
        })

        test('is a multi-remote browser', () => {
            expect(isMultiRemoteBrowser(multiRemoteBrowserFactory())).toBe(true)
        })
    })

    describe(isMock, () => {
        test('is not a mock without the brand', () => {
            expect(isMock({ calls: [] })).toBe(false)
        })

        test('a multi-remote mock is not a mock', () => {
            const multiRemoteMock = multiRemoteMockFactory({ chrome: setWdioKind({ calls: [] }, 'mock') as unknown as WebdriverIO.Mock })

            expect(isMock(multiRemoteMock)).toBe(false)
            expect(isMultiRemoteMock(multiRemoteMock)).toBe(true)
        })

        test('is not a multi-remote mock without the brand', () => {
            expect(isMultiRemoteMock({ isMultiRemote: true, instances: ['chrome'], getInstance: () => ({ calls: [] }) })).toBe(false)
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

    describe(hasMultiRemoteFlag, () => {
        test.each([
            ['WebdriverIO v10 `isMultiRemote`', { isMultiRemote: true }],
            ['@wdio/globals proxy of a class', new Proxy(class Browser {}, { get: (_, prop) => prop === 'isMultiRemote' })],
        ])('is true for %s', (_, value) => {
            expect(hasMultiRemoteFlag(value)).toBe(true)
        })

        test.each([undefined, null, 'isMultiRemote', {}, { isMultiRemote: false }, { isMultiremote: true }])('is false for %s', (value) => {
            expect(hasMultiRemoteFlag(value)).toBe(false)
        })
    })

    describe(isMockArray, () => {
        const mock = () => setWdioKind({ calls: [] }, 'mock') as unknown as WebdriverIO.Mock

        test('is true for a non-empty array of mocks', () => {
            expect(isMockArray([mock(), mock()])).toBe(true)
        })

        test.each([[], mock(), [mock(), {}], ['a'], undefined])('is false for %s', (value) => {
            expect(isMockArray(value)).toBe(false)
        })
    })

    describe(getMockInstanceNames, () => {
        const mocks = (length: number) => Array.from({ length }, () => setWdioKind({ calls: [] }, 'mock') as unknown as WebdriverIO.Mock)

        afterEach(() => {
            vi.unstubAllGlobals()
        })

        test('names the mocks after the global multiRemoteBrowser instances, in the same order', () => {
            vi.stubGlobal('multiRemoteBrowser', multiRemoteBrowserFactory())

            expect(getMockInstanceNames(mocks(2))).toEqual({ names: ['chrome', 'firefox'], isNamedByInstance: true })
        })

        test('names the mocks by index when they are not as many as the global instances, e.g. from select()', () => {
            vi.stubGlobal('multiRemoteBrowser', multiRemoteBrowserFactory())

            expect(getMockInstanceNames(mocks(1))).toEqual({ names: ['mocks[0]'], isNamedByInstance: false })
        })

        test('names the mocks by index without the global multiRemoteBrowser', () => {
            expect(getMockInstanceNames(mocks(2))).toEqual({ names: ['mocks[0]', 'mocks[1]'], isNamedByInstance: false })
        })
    })

    describe(isMultiRemoteValues, () => {
        test('is true for a non-empty plain object', () => {
            expect(isMultiRemoteValues({ chrome: 'a', firefox: 'b' })).toBe(true)
        })

        test('requires one of the instance names when given', () => {
            expect(isMultiRemoteValues({ chrome: 'a' }, ['chrome', 'firefox'])).toBe(true)
            expect(isMultiRemoteValues({ safari: 'a' }, ['chrome', 'firefox'])).toBe(false)
        })

        test.each(['a', 1, ['a'], {}, /a/, expect.stringContaining('a'), null, undefined])('is false for %s', (value) => {
            expect(isMultiRemoteValues(value)).toBe(false)
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
                    throw new Error('Multi-remote object has no instance named "firefox"')
                }
                return getInstance(name)
            }) as WebdriverIO.MultiRemoteElement['getInstance']

            const perInstance = getElementsPerInstance(elements, ['chrome', 'firefox'])

            expect(perInstance.chrome).toEqual([elements[0].getInstance('chrome'), getInstance('chrome')])
            expect(perInstance.firefox).toEqual([elements[0].getInstance('firefox')])
        })
    })

})
