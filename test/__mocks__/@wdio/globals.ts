/**
 * The real globals is mocked under the root folder.
 * This file exist for better typed mock implementation, so that we can follow wdio/globals API updates more easily.
 */
import { vi } from 'vitest'
import type { ChainablePromiseArray, ChainablePromiseElement, ParsedCSSValue } from 'webdriverio'
import type { Size } from '../../../src/matchers.js'

vi.mock('@wdio/globals')
vi.mock('../../../src/constants.js', async () => ({
    DEFAULT_OPTIONS: {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        ...(await vi.importActual<typeof import('../../../src/constants.js')>('../../../src/constants.js')).DEFAULT_OPTIONS,
        // speed up tests by lowering default wait timeout
        wait : 1
    }
}))

vi.mock('../../../src/util/waitUntil.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../../../src/util/waitUntil.js')>()
    return {
        ...actual,
        waitUntil: vi.spyOn(actual, 'waitUntil')
    }
})
vi.mock('../../../src/utils.js', async (importOriginal) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const actual = await importOriginal<typeof import('../../../src/utils.js')>()
    return {
        ...actual,
        executeCommandBe: vi.spyOn(actual, 'executeCommandBe'),
    }
})

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

    // Mimic element not found by throwing error on any method call besides isExisting
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
    return chainableElementArrayFactory(selector, 2)
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

    // Ensure critical array methods are properly accessible for type compatibility with MultiRemoteElement[]
    // Note: WebdriverIO.ElementArray has async versions of some methods (map, forEach, some, every, find, findIndex)
    // so we only bind the synchronous array methods that don't conflict
    // const arrayPrototype = Array.prototype
    // elementArray.slice = arrayPrototype.slice.bind(elementArray)
    // elementArray.concat = arrayPrototype.concat.bind(elementArray)
    // elementArray.join = arrayPrototype.join.bind(elementArray)
    // elementArray.indexOf = arrayPrototype.indexOf.bind(elementArray)
    // elementArray.lastIndexOf = arrayPrototype.lastIndexOf.bind(elementArray)
    // elementArray.reduce = arrayPrototype.reduce.bind(elementArray)
    // elementArray.reduceRight = arrayPrototype.reduceRight.bind(elementArray)
    // elementArray.reverse = arrayPrototype.reverse.bind(elementArray)
    // elementArray.sort = arrayPrototype.sort.bind(elementArray)
    // elementArray.splice = arrayPrototype.splice.bind(elementArray)
    // elementArray.push = arrayPrototype.push.bind(elementArray)
    // elementArray.pop = arrayPrototype.pop.bind(elementArray)
    // elementArray.shift = arrayPrototype.shift.bind(elementArray)
    // elementArray.unshift = arrayPrototype.unshift.bind(elementArray)
    // elementArray.fill = arrayPrototype.fill.bind(elementArray)
    // elementArray.copyWithin = arrayPrototype.copyWithin.bind(elementArray)
    // Note: keys, values, entries, and Symbol.iterator inherit from the array prototype
    // map, forEach, some, every, find, findIndex are async in WebdriverIO.ElementArray

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

export const browserFactory = (): WebdriverIO.Browser => {
    return  {
        $,
        $$,
        execute: vi.fn(),
        setPermissions: vi.spyOn({ setPermissions: async () => {} }, 'setPermissions'),
        getUrl: vi.spyOn({ getUrl: async () => '  Valid text  ' }, 'getUrl'),
        getTitle: vi.spyOn({ getTitle: async () => 'Example Domain' }, 'getTitle'),
        call(fn: Function) { return fn() },
    } satisfies Partial<WebdriverIO.Browser> as unknown as WebdriverIO.Browser
}

export const browser = browserFactory()
