/**
 * The real globals is mocked under the root folder.
 * This file exist for better typed mock implementation, so that we can follow wdio/globals API updates more easily.
 */
import { vi } from 'vitest'
import type { ChainablePromiseArray, ChainablePromiseElement, ParsedCSSValue } from 'webdriverio'

import type { RectReturn } from '@wdio/protocols'
export type Size = Pick<RectReturn, 'width' | 'height'>

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
    getSize: vi.spyOn({ getSize: async (prop?: 'width' | 'height') => {
        if (prop === 'width') { return 100 }
        if (prop === 'height') { return 50 }
        return { width: 100, height: 50 } satisfies Size
    } },
    // Force wrong size & number typing, fixed by https://github.com/webdriverio/webdriverio/pull/15003
    'getSize') as unknown as WebdriverIO.Element['getSize'],
    $,
    $$,
} satisfies Partial<WebdriverIO.Element>)

export const elementFactory = (_selector: string, index?: number, parent: WebdriverIO.Browser | WebdriverIO.Element = browser): WebdriverIO.Element => {
    const partialElement = {
        selector: _selector,
        ...getElementMethods(),
        index,
        $,
        $$,
        parent
    } satisfies Partial<WebdriverIO.Element>

    const element = partialElement as unknown as WebdriverIO.Element
    element.getElement = vi.fn().mockResolvedValue(element)

    // Note: an element found has element.elementId while a not found has element.error
    element.elementId = `${_selector}${index ? '-' + index : ''}`

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

const $ = vi.fn((_selector: string) => {
    const element = elementFactory(_selector)

    // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
    const chainablePromiseElement = Promise.resolve(element) as unknown as ChainablePromiseElement

    // Ensure `'getElement' in chainableElement` is false while allowing to use `await chainableElement.getElement()`
    const runtimeChainableElement = new Proxy(chainablePromiseElement, {
        get(target, prop) {
            if (prop in element) {
                return element[prop as keyof WebdriverIO.Element]
            }
            const value = Reflect.get(target, prop)
            return typeof value === 'function' ? value.bind(target) : value
        }
    })
    return runtimeChainableElement
})

const $$ = vi.fn((selector: string) => {
    const length = (this as any)?._length || 2
    return chainableElementArrayFactory(selector, length)
})

export function elementArrayFactory(selector: string, length?: number): WebdriverIO.ElementArray {
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
    elementArray.parent = browser

    // TODO Verify if we need to implement other array methods
    // [Symbol.iterator]: array[Symbol.iterator].bind(array)
    // filter: vi.fn().mockReturnThis(),
    // map: vi.fn().mockReturnThis(),
    // find: vi.fn().mockReturnThis(),
    // forEach: vi.fn(),
    // some: vi.fn(),
    // every: vi.fn(),
    // slice: vi.fn().mockReturnThis(),
    // toArray: vi.fn().mockReturnThis(),
    // getElements: vi.fn().mockResolvedValue(array)

    return elementArray
}

export function chainableElementArrayFactory(selector: string, length: number) {
    const elementArray = elementArrayFactory(selector, length)

    // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
    const chainablePromiseArray = Promise.resolve(elementArray) as unknown as ChainablePromiseArray

    // Ensure `'getElements' in chainableElements` is false while allowing to use `await chainableElement.getElements()`
    const runtimeChainablePromiseArray = new Proxy(chainablePromiseArray, {
        get(target, prop) {
            if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                const index = parseInt(prop, 10)
                if (index >= length) {
                    const error = new Error(`Index out of bounds! $$(${selector}) returned only ${length} elements.`)
                    return new Proxy(Promise.resolve(), {
                        get(target, prop) {
                            if (prop === 'then') {
                                return (resolve: any, reject: any) => reject(error)
                            }
                            // Allow resolving methods like 'catch', 'finally' normally from the promise if needed,
                            // but usually we want any interaction to fail?
                            // Actually, standard promise methods might be accessed.
                            // But the user requirements says: `$$('foo')[3].getText()` should return a promise (that rejects).

                            // If accessing a property that exists on Promise (like catch, finally, Symbol.toStringTag), maybe we should be careful.
                            // However, the test expects `el` (the proxy) to be a Promise instance.
                            // And `el.getText()` to return a promise.

                            // If I return a function that returns a rejected promise for everything else:
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

    return runtimeChainablePromiseArray
}

export const browser = {
    $,
    $$,
    execute: vi.fn(),
    setPermissions: vi.spyOn({ setPermissions: async () => {} }, 'setPermissions'),
    getUrl: vi.spyOn({ getUrl: async () => '  Valid text  ' }, 'getUrl'),
    getTitle: vi.spyOn({ getTitle: async () => 'Example Domain' }, 'getTitle'),
    call(fn: Function) { return fn() },
} satisfies Partial<WebdriverIO.Browser> as unknown as WebdriverIO.Browser
