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
    getProperty: vi.spyOn({ getProperty: async (_prop: string) => undefined }, 'getProperty'),
    getText: vi.spyOn({ getText: async () => ' Valid Text ' }, 'getText'),
    getHTML: vi.spyOn({ getHTML: async () => { return '<Html/>' } }, 'getHTML'),
    getComputedLabel: vi.spyOn({ getComputedLabel: async () => 'Computed Label' }, 'getComputedLabel'),
    getComputedRole: vi.spyOn({ getComputedRole: async () => 'Computed Role' }, 'getComputedRole'),
    getSize: vi.spyOn({ getSize: async (prop?: 'width' | 'height') => {
        if (prop === 'width') { return 100 }
        if (prop === 'height') { return 50 }
        return { width: 100, height: 50 } satisfies Size
    } }, 'getSize') as WebdriverIO.Element['getSize'],
} satisfies Partial<WebdriverIO.Element>)

function $(_selector: string) {
    const element = {
        selector: _selector,
        ...getElementMethods(),
        $,
        $$
    } satisfies Partial<WebdriverIO.Element> as unknown as WebdriverIO.Element
    element.getElement = async () => Promise.resolve(element)
    return element as unknown as ChainablePromiseElement
}

function $$(selector: string) {
    const length = (this)?._length || 2
    const elements = Array(length).fill(null).map((_, index) => {
        const element = {
            selector,
            index,
            ...getElementMethods(),
            $,
            $$
        } satisfies Partial<WebdriverIO.Element> as unknown as WebdriverIO.Element
        element.getElement = async () => Promise.resolve(element)
        return element
    }) satisfies WebdriverIO.Element[] as unknown as WebdriverIO.ElementArray

    elements.foundWith = '$$'
    elements.props = []
    elements.props.length = length
    elements.selector = selector
    elements.getElements = async () => elements
    elements.length = length
    return elements as unknown as ChainablePromiseArray
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

