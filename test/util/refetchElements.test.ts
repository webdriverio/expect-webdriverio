import { vi, test, describe, beforeEach, expect } from 'vitest'
import { $$ } from '@wdio/globals'

import { refetchElements } from '../../src/util/refetchElements.js'

const createMockElementArray = (length: number): WebdriverIO.ElementArray => {
    const array = Array.from({ length }, () => ({}))
    const mockArray = {
        selector: 'parent',
        get length() { return array.length },
        set length(newLength: number) { array.length = newLength },
        parent: {
            $: vi.fn(),
            $$: vi.fn().mockReturnValue(array),
        },
        foundWith: '$$',
        props: [],
        [Symbol.iterator]: array[Symbol.iterator].bind(array),
        filter: vi.fn().mockReturnThis(),
        map: vi.fn().mockReturnThis(),
        find: vi.fn().mockReturnThis(),
        forEach: vi.fn(),
        some: vi.fn(),
        every: vi.fn(),
        slice: vi.fn().mockReturnThis(),
        toArray: vi.fn().mockReturnThis(),
    }
    return Object.assign(array, mockArray) as unknown as WebdriverIO.ElementArray
}

vi.mock('@wdio/globals', () => ({
    $$: vi.fn().mockImplementation(() => createMockElementArray(5))
}))

describe('refetchElements', () => {
    describe('given WebdriverIO.ElementArray type', () => {
        let elements: WebdriverIO.ElementArray

        beforeEach(async () => {
            elements = (await $$('parent')) as unknown as WebdriverIO.ElementArray
            // @ts-ignore
            elements.parent._length = 5
        })

        test('default', async () => {
            const actual = await refetchElements(elements, 5, true)
            expect(actual.length).toBe(5)
        })

        test('wait is 0', async () => {
            const actual = await refetchElements(elements, 0, true)
            expect(actual).toEqual(elements)
        })
    })

    describe('given WebdriverIO.Element[] type', () => {
        const elements: WebdriverIO.Element[] = [] as unknown as WebdriverIO.Element[]

        test('default', async () => {
            const actual = await refetchElements(elements, 0)
            expect(actual).toEqual([])
        })
    })
})
