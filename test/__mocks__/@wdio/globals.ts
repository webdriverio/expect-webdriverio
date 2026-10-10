/**
 * The real globals is mocked under the root folder.
 * This file exist for better typed mock implementation, so that we can follow wdio/globals API updates more easily.
 */
import { vi } from 'vitest'
import type { ChainablePromiseArray, ChainablePromiseElement, ParsedCSSValue } from 'webdriverio'
import { Size } from '../../../src/matchers/element/toHaveSize'
import { WDIO_KIND, type WdioKind } from '../../../src/util/wdioKind'

/** WebdriverIO v10 sets it on a not-awaited element (`$()`, `$$()[i]`) */
const WDIO_CHAINABLE = Symbol.for('wdio.chainable')

/** Brands a mock like WebdriverIO v10 `setWdioKind()`: a non-enumerable `Symbol.for('wdio.kind')`, so a copy has no brand */
export const setWdioKind = <T extends object>(target: T, kind: WdioKind): T =>
    Object.defineProperty(target, WDIO_KIND, { value: kind, configurable: true })

const getElementMethods = () => ({
    isDisplayed: vi.spyOn({ isDisplayed: async () => true }, 'isDisplayed'),
    isExisting: vi.spyOn({ isExisting: async () => true }, 'isExisting'),
    isSelected: vi.spyOn({ isSelected: async () => true }, 'isSelected'),
    isClickable: vi.spyOn({ isClickable: async () => true }, 'isClickable'),
    isFocused: vi.spyOn({ isFocused: async () => true }, 'isFocused'),
    isStable: vi.spyOn({ isStable: async () => true }, 'isStable'),
    isEnabled: vi.spyOn({ isEnabled: async () => true }, 'isEnabled'),
    getProperty: vi.spyOn({ getProperty: async (_prop: string) => '1' }, 'getProperty'),
    getText: vi.spyOn({ getText: async () => ' Valid Text ' }, 'getText'),
    getHTML: vi.spyOn({ getHTML: async () => { return '<Html/>' } }, 'getHTML'),
    getComputedLabel: vi.spyOn({ getComputedLabel: async () => 'Computed Label' }, 'getComputedLabel'),
    getComputedRole: vi.spyOn({ getComputedRole: async () => 'Computed Role' }, 'getComputedRole'),
    getTagName: vi.spyOn({ getTagName: async () => 'div' }, 'getTagName'),
    getAttribute: vi.spyOn({ getAttribute: async (_attr: string) => 'some attribute' }, 'getAttribute'),
    getCSSProperty: vi.spyOn({ getCSSProperty: async (_prop: string, _pseudo?: string) =>
        ({ value: 'colorValue', parsed: {} } satisfies ParsedCSSValue) }, 'getCSSProperty'),
    // We cannot type-safely mock overloaded functions, so we force the below implementation
    getSize: vi.fn().mockImplementation(async function(this: WebdriverIO.Element, prop?: 'width' | 'height'): Promise<number | Size> {
        if (prop === 'width') { return Promise.resolve(100) }
        if (prop === 'height') { return Promise.resolve(50) }
        return Promise.resolve({ width: 100, height: 50 })
    }),
    $,
    $$,
} satisfies Partial<WebdriverIO.Element>)

/**
 * When doing $() an passing and already resolved element, the selector field is stripped out!
 */
export const elementWithoutSelectorFactory = (index?: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browser): WebdriverIO.Element => {
    const partialElement = {
        ...getElementMethods(),
        index,
        $,
        $$,
        parent
    } satisfies Partial<WebdriverIO.Element>

    const element = setWdioKind(partialElement, 'element') as unknown as WebdriverIO.Element
    element.getElement = vi.fn().mockResolvedValue(element)

    // Note: an element found has element.elementId while a not found has element.error
    element.elementId = 'element-without-selector' + (index ? '-' + index : '')

    return element
}

export const elementFactory = (selector: string, index?: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browser): WebdriverIO.Element => {
    const partialElement = {
        selector: selector,
        ...getElementMethods(),
        index,
        $,
        $$,
        parent
    } satisfies Partial<WebdriverIO.Element>

    const element = setWdioKind(partialElement, 'element') as unknown as WebdriverIO.Element
    element.getElement = vi.fn().mockResolvedValue(element)

    // Note: an element found has element.elementId while a not found has element.error
    element.elementId = `${selector}${index ? '-' + index : ''}`

    return element
}

export const notFoundElementFactory = (_selector: string, index?: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browser): WebdriverIO.Element => {
    const partialElement = {
        selector: _selector,
        index,
        $,
        $$,
        isExisting: vi.fn().mockResolvedValue(false),
        parent
    } satisfies Partial<WebdriverIO.Element>

    const element = setWdioKind(partialElement, 'element') as unknown as WebdriverIO.Element

    // Note: an element found has element.elementId while a not found has element.error
    const elementId = `${_selector}${index ? '-' + index : ''}`
    const error = (functionName: string) => new Error(`Can't call ${functionName} on element with selector ${elementId} because element wasn't found`)

    // Mimic element not found by throwing error on any method call beisde isExisting
    const notFoundElement = new Proxy(element, {
        get(target, prop) {
            if (prop in element) {
                const value = element[prop as keyof WebdriverIO.Element]
                return value
            }
            if (['then', 'catch', 'toStringTag'].includes(prop as string) || typeof prop === 'symbol') {
                const value = Reflect.get(target, prop)
                return typeof value === 'function' ? value.bind(target) : value
            }
            element.error = error(prop as string)
            return () => { throw element.error }
        }
    })

    element.getElement = vi.fn().mockResolvedValue(notFoundElement)

    return notFoundElement
}

export const $Factory = (element: WebdriverIO.Element, findDelay = 0): ChainablePromiseElement => {
    // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
    let chainablePromiseElement = Promise.resolve(element)

    // Fake finding time of an element
    if (findDelay > 0) {
        // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
        chainablePromiseElement = new Promise<WebdriverIO.Element>((resolve) => {
            setTimeout(() => resolve(element), findDelay)
        })
    }

    // Ensure `'getElement' in chainableElement` at runtime does not exist while allowing to use `await chainableElement.getElement()`
    const runtimeChainableElement = new Proxy(chainablePromiseElement, {
        get(target, prop) {
            // Like WebdriverIO v10: a not-awaited `$()` has the `element` brand (read below from the element) and is chainable
            if (prop === WDIO_CHAINABLE) {
                return true
            }
            if (prop in element) {
                const originalValue = element[prop as keyof WebdriverIO.Element]

                // 2. Wrap element methods to await the delayed Promise first
                if (findDelay > 0 && typeof originalValue === 'function') {
                    return async (...args: any[]) => {
                        await target // Wait for the delay to finish
                        return (originalValue as Function).apply(element, args)
                    }
                }
                return originalValue
            }
            const value = Reflect.get(target, prop)
            return typeof value === 'function' ? value.bind(target) : value
        }
    })
    return runtimeChainableElement as unknown as ChainablePromiseElement
}

/**
 * Mocks a not-awaited multi-remote `$()` like WebdriverIO v10: a Promise of the element, with the `element` brand and `wdio.chainable`
 */
const notAwaitedMultiRemoteElementMock = (element: Promise<WebdriverIO.MultiRemoteElement>): ChainablePromiseElement =>
    new Proxy(element, {
        get(target, prop) {
            if (prop === WDIO_KIND) {
                return 'element'
            }
            if (prop === WDIO_CHAINABLE) {
                return true
            }
            const value = Reflect.get(target, prop)
            return typeof value === 'function' ? value.bind(target) : value
        }
    }) as unknown as ChainablePromiseElement

/** Like WebdriverIO v10: `for...of` and the spread of a list throw until the list is loaded */
const notLoadedIterator = (): never => {
    throw new Error('Cannot synchronously iterate over an element list that has not resolved yet. Use `for await (const el of $$(\'...\')) { ... }` instead.')
}

/**
 * Mirrors WebdriverIO v10 `StrictSelectorError`, thrown by a strict `$()` when the selector matches several elements.
 * @see https://github.com/webdriverio/webdriverio/issues/15666
 */
export class StrictSelectorError extends Error {
    matches: number
    selector: string

    constructor(selector: string, matches: number) {
        const printable = JSON.stringify(selector)
        super(
            `strict mode violation: \`$(${printable})\` resolved to ${matches} elements, expected 1.\n` +
            `Use \`$$(${printable})\` to work with all matches, \`$$(${printable})[0]\` if you explicitly ` +
            'want the first one, or narrow down the selector so it matches a single element.\n' +
            `Opt out for a single call with \`$(${printable}, { strict: false })\` or globally by setting ` +
            '`strictSelectors: false` in your WebdriverIO config.'
        )
        this.name = 'StrictSelectorError'
        this.matches = matches
        this.selector = selector
    }
}

export const $ = vi.fn((_selector: Parameters<WebdriverIO.Element['$']>[0]) => {
    const element = elementFactory(_selector as string)

    return $Factory(element)
})

export const $$ = vi.fn((selector: Parameters<WebdriverIO.Element['$$']>[0]) => {
    return chainableElementArrayFactory(selector as string, 2, browserFactory())
})

export function elementArrayFactory(selector: string, length: number = 2, parent: WebdriverIO.Browser | WebdriverIO.Element = browserFactory(length)): WebdriverIO.ElementArray {
    const elements: WebdriverIO.Element[] = Array(length).fill(null).map((_, index) => elementFactory(selector, index))

    const elementArray = setWdioKind(elements, 'element-array') as unknown as WebdriverIO.ElementArray

    elementArray.foundWith = '$$'
    elementArray.props = []
    elementArray.selector = selector
    elementArray.getElements = vi.fn().mockResolvedValue(elementArray)
    elementArray.filter = async <T>(fn: (element: WebdriverIO.Element, index: number, array: T[]) => boolean | Promise<boolean>) => {
        const results = await Promise.all(elements.map((el, i) => fn(el, i, elements as unknown as T[])))
        return Array.prototype.filter.call(elements, (_, i) => results[i])
    }
    elementArray.parent = parent

    return elementArray
}

/**
 * Mocks a not-awaited `$$()` like WebdriverIO v10: it is the element list itself, not a Promise. Until it is awaited,
 * it has `then`, `catch` and `finally`, and its `length` is a Promise. Awaiting it resolves to the same list, without `then`.
 */
export function chainableElementArrayFactory(selector: string, length: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browserFactory()): ChainablePromiseArray {
    const elementArray = elementArrayFactory(selector, length, parent)
    let resolved = false
    let loading: Promise<WebdriverIO.ElementArray> | undefined
    // Like the `load()` of WebdriverIO v10: the list is resolved later, not when the load starts
    const settle = () => loading ??= new Promise((resolve) => setTimeout(() => {
        resolved = true
        resolve(runtimeChainablePromiseArray as unknown as WebdriverIO.ElementArray)
    }))

    const runtimeChainablePromiseArray: ChainablePromiseArray = new Proxy(elementArray, {
        get(target, prop, receiver) {
            if (!resolved) {
                if (prop === 'then') {
                    return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => settle().then(onFulfilled, onRejected)
                }
                if (prop === 'catch' || prop === 'finally') {
                    return (handler: () => unknown) => settle()[prop](handler)
                }
                if (prop === 'length') {
                    return settle().then(() => target.length)
                }
                if (prop === Symbol.iterator) {
                    return notLoadedIterator
                }
            }
            if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                // Simulate index out of bounds error when asking for an element outside the array length
                const index = parseInt(prop, 10)
                // The current length: a refetch writes the new elements into the same list
                if (index >= target.length) {
                    const error = new Error(`Index out of bounds! $$(${selector}) returned only ${target.length} elements.`)
                    return new Proxy(Promise.resolve(), {
                        get(_target, prop) {
                            if (prop === 'then') {
                                return (_resolve: any, reject: any) => reject(error)
                            }
                            return () => Promise.reject(error)
                        }
                    })
                }
            }
            return Reflect.get(target, prop, receiver)
        }
    }) as unknown as ChainablePromiseArray
    elementArray.getElements = vi.fn().mockImplementation(async () => {
        await settle()
        return runtimeChainablePromiseArray
    })

    elementArray.parent.$$ = vi.fn().mockImplementation((selector: string) =>   {
        if (selector === elementArray.selector) {
            return runtimeChainablePromiseArray
        }

        return chainableElementArrayFactory(selector, length, elementArray.parent as WebdriverIO.Browser)
    })

    return runtimeChainablePromiseArray
}
export class Browser {
    $ = vi.fn((selector: string) => {
        const element = elementFactory(selector)
        return $Factory(element)
    })
    $$ = vi.fn()
    execute = vi.fn()
    setPermissions = vi.spyOn({ setPermissions: async () => {} }, 'setPermissions')
    getUrl = vi.spyOn({ getUrl: async () => '  Valid text  ' }, 'getUrl')
    getTitle = vi.spyOn({ getTitle: async () => 'Example Domain' }, 'getTitle')

    constructor(elementArrayLength = 2) {
        vi.mocked(this.$$).mockImplementation((selector: string) => {
            return chainableElementArrayFactory(selector, elementArrayLength, this as unknown as WebdriverIO.Browser)
        })
    }

    call(fn: Function) {
        return fn()
    }
}

setWdioKind(Browser.prototype, 'browser')

export const browserFactory = (elementArrayLength = 2): WebdriverIO.Browser => {
    return new Browser(elementArrayLength) as unknown as WebdriverIO.Browser
}

export const browser = browserFactory()

/**
 * Mocks a WebdriverIO v10 `BrowsingContext`: a tab, a window or a frame of `browser`.
 * Like WebdriverIO, it has its own `$`, `$$`, `execute`, `getUrl` and `getTitle`, but no session command (`setPermissions`).
 */
export const browsingContextFactory = (
    { browser = browserFactory(), isFrame = false, url = 'https://example.com/' }: { browser?: WebdriverIO.Browser, isFrame?: boolean, url?: string } = {}
): WebdriverIO.BrowsingContext => {
    const context = setWdioKind({
        contextId: isFrame ? 'frame-1' : 'context-1',
        browser,
        isFrame,
        url,
        $: vi.fn((selector: string) => $Factory(elementFactory(selector))),
        $$: vi.fn(),
        execute: vi.fn(),
        getUrl: vi.fn(async () => url),
        getTitle: vi.fn(async () => 'Example Domain'),
    }, 'browsing-context')
    context.$$.mockImplementation((selector: string) => chainableElementArrayFactory(selector, 2, context as unknown as WebdriverIO.Browser))
    return context as unknown as WebdriverIO.BrowsingContext
}

export class CustomMultiRemoteDriver {
    // Multi remote properties
    [key: string]: unknown
    instances: string[]
    isMultiRemote = true
    select = vi.fn()
    getInstance = vi.fn()

    // Common Browser methods
    $ = vi.fn()
    $$ = vi.fn()
    execute = vi.fn()
    setPermissions = vi.fn()
    getUrl = vi.fn()
    getTitle = vi.fn()

    constructor(
        browsers: Record<string, WebdriverIO.Browser> = {
            chrome: browserFactory(),
            firefox: browserFactory(),
        }
    ) {
        /**
         * Multi-remote properties
         * Like WebdriverIO v10: instances are not attached as properties (`browser.chrome`), only reachable with `getInstance()`
         */
        const availableBrowsers = Object.values(browsers)

        this.instances = Object.keys(browsers)

        vi.mocked(this.select).mockImplementation((...instanceNames: string[]) => {
            const selectedBrowsers: Record<string, WebdriverIO.Browser> = {}
            for (const name of instanceNames) {
                if (name in browsers) {
                    selectedBrowsers[name] = browsers[name]
                }
            }
            if (Object.keys(selectedBrowsers).length === 0) {
                throw new Error('None of the following requested instances are valid: ' + instanceNames.join(', '))
            }
            return multiRemoteBrowserFactory(selectedBrowsers)
        })

        vi.mocked(this.getInstance).mockImplementation((instanceName: string) => {
            if (!(instanceName in browsers)) {
                throw new Error(`Multi-remote object has no instance named "${instanceName}"`)
            }
            return browsers[instanceName]
        })

        /**
         * Common browser methods
         */
        // Like `MultiRemote.elementWrapper()` at runtime: one `MultiRemoteElement` wrapping each instance's resolved element
        vi.mocked(this.$).mockImplementation((selector: string) => notAwaitedMultiRemoteElementMock((async () => {
            const instanceElements = await Promise.all(availableBrowsers.map((browser) => browser.$(selector))) as unknown as WebdriverIO.Element[]
            return buildMultiRemoteElementWrapper(this.instances, instanceElements, selector)
        })()))

        vi.mocked(this.$$).mockImplementation((selector: string) => {
            return notAwaitedMultiRemoteElementArrayMock(browsers, selector, 2, this as unknown as WebdriverIO.MultiRemoteBrowser)
        })

        vi.mocked(this.setPermissions).mockImplementation((descriptor: object, state: string, oneRealm?: boolean) => {
            return Promise.all(availableBrowsers.map((browser) => browser.setPermissions(descriptor, state, oneRealm)))
        })

        vi.mocked(this.getUrl).mockImplementation(() => {
            return Promise.all(availableBrowsers.map((browser) => browser.getUrl()))
        })

        vi.mocked(this.getTitle).mockImplementation(() => {
            return Promise.all(availableBrowsers.map((browser) => browser.getTitle()))
        })
    }
}

setWdioKind(CustomMultiRemoteDriver.prototype, 'browser')

export const multiRemoteBrowserFactory = (
    browsers?: Record<string, WebdriverIO.Browser>
): WebdriverIO.MultiRemoteBrowser => {
    return new CustomMultiRemoteDriver(browsers) as unknown as WebdriverIO.MultiRemoteBrowser
}

export const multiRemoteBrowser = multiRemoteBrowserFactory()

/**
 * Wraps one already-fetched element per instance into a `WebdriverIO.MultiRemoteElement`, mirroring
 * `MultiRemote.elementWrapper()` at runtime. Shared by `createMultiRemoteElementMock` (single element,
 * via `$()`) and `createMultiRemoteElementArrayMock` (one wrapper per index, via `$$()`).
 */
const buildMultiRemoteElementWrapper = (
    instances: string[],
    instanceElements: WebdriverIO.Element[],
    selector: string
): WebdriverIO.MultiRemoteElement => {
    const multiRemoteElement = {
        isMultiRemote: true,
        selector,
        instances: instances,

        // Returns specific element instance by session name
        getInstance(name: string) {
            const idx = instances.indexOf(name)
            if (idx === -1) {
                throw new Error(`Multi-remote object has no instance named "${name}"`)
            }
            return instanceElements[idx] as unknown as WebdriverIO.Element
        },

        // Delegate $() on multi-remote element across all browser instances
        $: vi.fn().mockImplementation((subSelector: string) => {
            const childBrowsers: Record<string, WebdriverIO.Browser> = {}
            instances.forEach((name, index) => {
                childBrowsers[name] = {
                    $: () => instanceElements[index].$(subSelector),
                    $$: () => instanceElements[index].$$(subSelector),
                } satisfies Partial<WebdriverIO.Browser> as unknown as WebdriverIO.Browser
            })
            return notAwaitedMultiRemoteElementMock(Promise.resolve(createMultiRemoteElementMock(childBrowsers, subSelector)))
        }),

        // Delegate $$() across all browser instances
        $$: vi.fn().mockImplementation((subSelector: string) => {
            const childBrowsers: Record<string, WebdriverIO.Browser> = {}
            instances.forEach((name, index) => {
                childBrowsers[name] = {
                    $: () => instanceElements[index].$(subSelector),
                    $$: () => instanceElements[index].$$(subSelector),
                } satisfies Partial<WebdriverIO.Browser> as unknown as WebdriverIO.Browser
            })
            return notAwaitedMultiRemoteElementArrayMock(childBrowsers, subSelector, 2, multiRemoteElement)
        }),

        // Common element method proxies returning Promise.all array of results
        click: vi.fn().mockImplementation(() =>
            Promise.all(instanceElements.map((el) => el.click()))
        ),
        getText: vi.fn().mockImplementation(() =>
            Promise.all(instanceElements.map((el) => el.getText()))
        ),
        setValue: vi.fn().mockImplementation((val: string) =>
            Promise.all(instanceElements.map((el) => el.setValue(val)))
        ),
        isDisplayed: vi.fn().mockImplementation(() =>
            Promise.all(instanceElements.map((el) => el.isDisplayed()))
        ),
    } satisfies Partial<WebdriverIO.MultiRemoteElement> & { isMultiRemote: true } as unknown as WebdriverIO.MultiRemoteElement

    return setWdioKind(multiRemoteElement, 'element')
}

export function createMultiRemoteElementMock(
    browsers: Record<string, WebdriverIO.Browser>,
    selector: string
): WebdriverIO.MultiRemoteElement {
    const instances = Object.keys(browsers)

    // TODO can we remove `as unknown` here?
    const instanceElements = instances.map((name) => browsers[name].$(selector)) as unknown as WebdriverIO.Element[]

    return buildMultiRemoteElementWrapper(instances, instanceElements, selector)
}

/**
 * Mocks `multiRemoteBrowser.$$()` / `multiRemoteElement.$$()`, mirroring WebdriverIO's real behavior: results are zipped
 * by index across instances into `MultiRemoteElement` wrappers, in a `MultiRemoteElementArray` decorated with
 * ElementArray-like properties (`.parent`, `.foundWith`, `.getElements()`, an async-aware `.forEach()`) and
 * `isMultiRemote: true`, matching `enhanceElementsArray()` at runtime.
 */
/**
 * Mocks a not-awaited multi-remote `$$()` like WebdriverIO v10: the `MultiRemoteElementArray` itself, not a Promise.
 * Until it is awaited, it has `then`, `catch` and `finally`, and its `length` is a Promise. Awaiting it gives the same list.
 */
export function notAwaitedMultiRemoteElementArrayMock(
    browsers: Record<string, WebdriverIO.Browser>,
    selector: string,
    length = 2,
    parent: WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement = multiRemoteBrowserFactory(browsers)
): WebdriverIO.MultiRemoteElementArray {
    const elementArray = createMultiRemoteElementArrayMock(browsers, selector, length, parent)
    let resolved = false
    let loading: Promise<WebdriverIO.MultiRemoteElementArray> | undefined
    // Like the `load()` of WebdriverIO v10: the list is resolved later, not when the load starts
    const settle = () => loading ??= new Promise((resolve) => setTimeout(() => {
        resolved = true
        resolve(notAwaited)
    }))
    const notAwaited: WebdriverIO.MultiRemoteElementArray = new Proxy(elementArray, {
        get(target, prop, receiver) {
            if (!resolved) {
                if (prop === 'then') {
                    return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => settle().then(onFulfilled, onRejected)
                }
                if (prop === 'catch' || prop === 'finally') {
                    return (handler: () => unknown) => settle()[prop](handler)
                }
                if (prop === 'length') {
                    return settle().then(() => target.length)
                }
                if (prop === Symbol.iterator) {
                    return notLoadedIterator
                }
            }
            return Reflect.get(target, prop, receiver)
        }
    })
    elementArray.getElements = vi.fn().mockImplementation(async () => {
        await settle()
        return notAwaited
    })
    return notAwaited
}

export function createMultiRemoteElementArrayMock(
    browsers: Record<string, WebdriverIO.Browser>,
    selector: string,
    length = 2,
    parent: WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement = multiRemoteBrowserFactory(browsers)
): WebdriverIO.MultiRemoteElementArray {
    const instances = Object.keys(browsers)

    // Per-instance element arrays, e.g. { chrome: [el0, el1], firefox: [el0, el1] }
    const instanceElementArrays = instances.map((name) => elementArrayFactory(selector, length, browsers[name]))

    // Zip by index across instances into MultiRemoteElement wrappers, mirroring `zip(...result)` at runtime.
    const wrapped: WebdriverIO.MultiRemoteElement[] = Array(length).fill(null).map((_, index) =>
        buildMultiRemoteElementWrapper(instances, instanceElementArrays.map((elements) => elements[index]), selector)
    )

    const elementArray = setWdioKind(wrapped, 'element-array') as unknown as WebdriverIO.MultiRemoteElementArray & { isMultiRemote: true }
    elementArray.isMultiRemote = true
    elementArray.selector = selector
    elementArray.foundWith = '$$'
    elementArray.props = []
    elementArray.parent = parent as WebdriverIO.MultiRemoteElementArray['parent']
    elementArray.getElements = vi.fn().mockResolvedValue(elementArray)
    // WebdriverIO's `enhanceElementsArray()` binds real async iterators here (running callbacks
    // concurrently and awaiting them, unlike `Array.prototype.forEach`); only `forEach` is mocked
    // since it's the only one this codebase currently relies on.
    elementArray.forEach = (async (callback: (element: WebdriverIO.MultiRemoteElement, index: number, array: WebdriverIO.MultiRemoteElement[]) => unknown) => {
        await Promise.all(wrapped.map((element, index) => callback(element, index, wrapped)))
    }) as unknown as WebdriverIO.MultiRemoteElementArray['forEach']

    return elementArray
}

/** Mocks a WebdriverIO v10 multi-remote `mock()`: a `MultiRemoteMock` with one mock per instance name */
export const multiRemoteMockFactory = (mocks: Record<string, WebdriverIO.Mock>): WebdriverIO.MultiRemoteMock => setWdioKind({
    isMultiRemote: true as const,
    instances: Object.keys(mocks),
    getInstance: (name: string) => mocks[name]
}, 'mock') as unknown as WebdriverIO.MultiRemoteMock
