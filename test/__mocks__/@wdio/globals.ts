/**
 * The real globals is mocked under the root folder.
 * This file exist for better typed mock implementation, so that we can follow wdio/globals API updates more easily.
 */
import { vi } from 'vitest'
import type { ChainablePromiseArray, ChainablePromiseElement, ParsedCSSValue } from 'webdriverio'
import { Size } from '../../../src/matchers/element/toHaveSize'

const getElementMethods = () => ({
    isDisplayed: vi.spyOn({ isDisplayed: async () => true }, 'isDisplayed'),
    isExisting: vi.spyOn({ isExisting: async () => true }, 'isExisting'),
    isSelected: vi.spyOn({ isSelected: async () => true }, 'isSelected'),
    isClickable: vi.spyOn({ isClickable: async () => true }, 'isClickable'),
    isFocused: vi.spyOn({ isFocused: async () => true }, 'isFocused'),
    isEnabled: vi.spyOn({ isEnabled: async () => true }, 'isEnabled'),
    getProperty: vi.spyOn({ getProperty: async (_prop: string) => '1' }, 'getProperty'),
    getText: vi.spyOn({ getText: async () => ' Valid Text ' }, 'getText'),
    getHTML: vi.spyOn({ getHTML: async () => { return '<Html/>' } }, 'getHTML'),
    getComputedLabel: vi.spyOn({ getComputedLabel: async () => 'Computed Label' }, 'getComputedLabel'),
    getComputedRole: vi.spyOn({ getComputedRole: async () => 'Computed Role' }, 'getComputedRole'),
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

    const element = partialElement as unknown as WebdriverIO.Element
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

    const element = partialElement as unknown as WebdriverIO.Element
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

    const element = partialElement as unknown as WebdriverIO.Element

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

export const $ = vi.fn((_selector: string) => {
    const element = elementFactory(_selector)

    return $Factory(element)
})

export const $$ = vi.fn((selector: string) => {
    return chainableElementArrayFactory(selector, 2, browserFactory())
})

export function elementArrayFactory(selector: string, length: number = 2, parent: WebdriverIO.Browser | WebdriverIO.Element = browserFactory(length)): WebdriverIO.ElementArray {
    const elements: WebdriverIO.Element[] = Array(length).fill(null).map((_, index) => elementFactory(selector, index))

    const elementArray = elements as unknown as WebdriverIO.ElementArray

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

export function chainableElementArrayFactory(selector: string, length: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browserFactory()): ChainablePromiseArray {
    const elementArray = elementArrayFactory(selector, length, parent)

    // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
    const chainablePromiseArray = Promise.resolve(elementArray) as unknown as ChainablePromiseArray

    // Ensure `'getElements' in chainableElements` is false while allowing to use `await chainableElement.getElements()`
    const runtimeChainablePromiseArray = new Proxy(chainablePromiseArray, {
        get(target, prop) {
            if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                // Simulate index out of bounds error when asking for an element outside the array length
                const index = parseInt(prop, 10)
                if (index >= length) {
                    const error = new Error(`Index out of bounds! $$(${selector}) returned only ${length} elements.`)
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
            if (elementArray && prop in elementArray) {
                return elementArray[prop as keyof WebdriverIO.ElementArray]
            }
            const value = Reflect.get(target, prop)
            return typeof value === 'function' ? value.bind(target) : value
        }
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
    getUrl = vi.fn().mockResolvedValue('  Valid text  ')
    getTitle = vi.fn().mockResolvedValue('Example Domain')

    constructor(elementArrayLength = 2) {
        vi.mocked(this.$$).mockImplementation((selector: string) => {
            return chainableElementArrayFactory(selector, elementArrayLength, this as unknown as WebdriverIO.Browser)
        })
    }

    call(fn: Function) {
        return fn()
    }
}

export const browserFactory = (elementArrayLength = 2): WebdriverIO.Browser => {
    return new Browser(elementArrayLength) as unknown as WebdriverIO.Browser
}

export const browser = browserFactory()

export class CustomMultiRemoteDriver {
    // Multi remote properties
    [key: string]: unknown
    instances: string[]
    isMultiremote = true
    unstable_select = vi.fn()
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
         */
        // Attach browser instances (e.g., this.chrome, this.firefox)
        Object.assign(this, browsers)

        const availableBrowsers = Object.values(browsers)

        this.instances = Object.keys(browsers)

        vi.mocked(this.unstable_select).mockImplementation((...instanceNames: string[]) => {
            const selectedBrowsers: Record<string, WebdriverIO.Browser> = {}
            for (const name of instanceNames) {
                selectedBrowsers[name] = this[name] as WebdriverIO.Browser
            }
            return multiRemoteBrowserFactory(selectedBrowsers)
        })

        vi.mocked(this.getInstance).mockImplementation((instanceName: string) => {
            return this[instanceName] as WebdriverIO.Browser
        })

        /**
         * Common browser methods
         */
        vi.mocked(this.$).mockImplementation((selector: string) => {
            return Promise.all(availableBrowsers.map((browser) => browser.$(selector)))
        })

        vi.mocked(this.$$).mockImplementation((selector: string) => {
            return Promise.all(availableBrowsers.map((browser) => browser.$$(selector)))
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

export const multiRemoteBrowserFactory = (
    browsers?: Record<string, WebdriverIO.Browser>
): WebdriverIO.MultiRemoteBrowser => {
    return new CustomMultiRemoteDriver(browsers) as unknown as WebdriverIO.MultiRemoteBrowser
}

export const multiRemoteBrowser = multiRemoteBrowserFactory()

interface MockBrowser {
    $: ReturnType<typeof vi.fn>
    $$: ReturnType<typeof vi.fn>
    [key: string]: any
}

export function createMultiRemoteElementMock(
    browsers: Record<string, MockBrowser>,
    selector: string
): WebdriverIO.MultiRemoteElement {
    const instanceNames = Object.keys(browsers)

    // 1. Fetch element instance from each browser mock
    // @ts-expect-error: TODO to fix
    const instances = instanceNames.map((name) => browsers[name].$(selector))

    // 2. Base wrapper object
    const multiRemoteElement: any = {
        isMultiremote: true,
        selector,
        instances,
        instancesNames: instanceNames,

        // Returns specific element instance by session name
        getInstance(name: string) {
            const idx = instanceNames.indexOf(name)
            if (idx === -1) {
                throw new Error(`Instance "${name}" not found in multiremote session.`)
            }
            return instances[idx]
        },

        // Delegate $() on multiremote element across all browser instances
        $: vi.fn().mockImplementation((subSelector: string) => {
            const childBrowsers: Record<string, MockBrowser> = {}
            instanceNames.forEach((name, index) => {
                childBrowsers[name] = {
                    // @ts-expect-error: TODO to fix
                    $: () => instances[index].$(subSelector),
                    // @ts-expect-error: TODO to fix
                    $$: () => instances[index].$$(subSelector),
                }
            })
            return createMultiRemoteElementMock(childBrowsers, subSelector)
        }),

        // Delegate $$() across all browser instances
        $$: vi.fn().mockImplementation((subSelector: string) => {
            return Promise.all(
                instances.map((el) => el.$$(subSelector))
            )
        }),

        // Common element method proxies returning Promise.all array of results
        click: vi.fn().mockImplementation(() =>
            Promise.all(instances.map((el) => el.click()))
        ),
        getText: vi.fn().mockImplementation(() =>
            Promise.all(instances.map((el) => el.getText()))
        ),
        setValue: vi.fn().mockImplementation((val: string) =>
            Promise.all(instances.map((el) => el.setValue(val)))
        ),
        isDisplayed: vi.fn().mockImplementation(() =>
            Promise.all(instances.map((el) => el.isDisplayed()))
        ),
    }

    // 3. Attach named instance shortcuts (e.g. multiElement.chrome, multiElement.firefox)
    instanceNames.forEach((name, idx) => {
        multiRemoteElement[name] = instances[idx]
    })

    return multiRemoteElement as WebdriverIO.MultiRemoteElement
}

/**
 * Mock wrapper for multiremote global $() lookup (Patterned after line 290)
 */
export function createMultiRemote$Mock(
    browsers: Record<string, MockBrowser>
) {
    return vi.fn().mockImplementation((selector: string) => {
        return createMultiRemoteElementMock(browsers, selector)
    })
}

/**
 * Mock wrapper for multiremote global $$() lookup (Patterned after line 294)
 */
export function createMultiRemote$$zMock(
    browsers: Record<string, MockBrowser>
) {
    return vi.fn().mockImplementation((selector: string) => {
        return Promise.all(
            // @ts-ignore TODO: to fix
            Object.values(browsers).map((browser) => browser.$$(selector))
        )
    })
}
