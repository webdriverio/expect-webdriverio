/**
 * The real globals is mocked under the root folder.
 * This file exist for better typed mock implementation, so that we can follow wdio/globals API updates more easily.
 */
import { vi } from 'vitest'
import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio'

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
    // Null is not part of the type, to fix in wdio one day
    getAttribute: vi.spyOn({ getAttribute: async (_attr: string) => null as unknown as string }, 'getAttribute'),
    getSize: vi.spyOn({ getSize: async (prop?: 'width' | 'height') => {
        if (prop === 'width') { return 100 }
        if (prop === 'height') { return 50 }
        return { width: 100, height: 50 } satisfies Size
    } }, 'getSize') as unknown as WebdriverIO.Element['getSize'],
    getAttribute: vi.spyOn({ getAttribute: async (_attr: string) => 'some attribute' }, 'getAttribute'),
} satisfies Partial<WebdriverIO.Element>)

const elementFactory = (_selector: string, index?: number): WebdriverIO.Element => {
    const partialElement = {
        selector: _selector,
        ...getElementMethods(),
        index,
        $,
        $$
    } satisfies Partial<WebdriverIO.Element>

    const element = partialElement as unknown as WebdriverIO.Element
    element.getElement = vi.fn().mockResolvedValue(element)
    return element
}

function $(_selector: string) {
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
}

function $$(selector: string) {
    const length = (this as any)?._length || 2
    const elements: WebdriverIO.Element[] = Array(length).fill(null).map((_, index) => elementFactory(selector, index))

    const elementArray = elements as unknown as WebdriverIO.ElementArray

    elementArray.foundWith = '$$'
    elementArray.props = []
    elementArray.props.length = length
    elementArray.selector = selector
    elementArray.getElements = async () => elementArray
    elementArray.length = length

    // Wdio framework does return a Promise-wrapped element, so we need to mimic this behavior
    const chainablePromiseArray = Promise.resolve(elementArray) as unknown as ChainablePromiseArray

    // Ensure `'getElements' in chainableElements` is false while allowing to use `await chainableElement.getElements()`
    const runtimeChainablePromiseArray = new Proxy(chainablePromiseArray, {
        get(target, prop) {
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

