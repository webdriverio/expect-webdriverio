import { vi, test, describe, beforeEach, expect } from 'vitest'
import { $$ } from '@wdio/globals'

import { refetchElements } from '../../src/util/refetchElements.js'
import { browserFactory, chainableElementArrayFactory, elementFactory } from '../__mocks__/@wdio/globals.js'

vi.mock('@wdio/globals')

describe(refetchElements, () => {
    describe('given WebdriverIO.ElementArray type', () => {
        let elements: WebdriverIO.ElementArray

        beforeEach(async () => {
            elements = await $$('elements').getElements()

            // Have a different browser instance and $$ implementation to be able to assert calls
            elements.parent = browserFactory()
            elements.parent.$$ = vi.fn().mockResolvedValue(
                chainableElementArrayFactory('elements', 5) as unknown as ChainablePromiseArray & WebdriverIO.MultiRemoteElement[]
            )
        })

        test('default should refresh once', async () => {

            const actual = await refetchElements(elements, 5, true)

            expect(actual.length).toBe(5)
            expect(actual).not.toBe(elements)
            expect(elements.parent.$$).toHaveBeenCalledTimes(1)
        })

        test('wait is 0 should not refresh', async () => {
            const wait = 0

            const actual = await refetchElements(elements, wait, true)

            expect(actual).toEqual(elements)
            expect(actual).toHaveLength(2)
            expect(elements.parent.$$).not.toHaveBeenCalled()
        })

        test('should call $$ with all props', async () => {
            elements.props = ['prop1', 'prop2']

            await refetchElements(elements, 5, true)

            expect(elements.parent.$$).toHaveBeenCalledWith('elements', 'prop1', 'prop2')
        })

        test('should call $$ with the proper parent this context', async () => {
            const parentFoundWith = vi.mocked(elements.parent.$$)

            await refetchElements(elements, 5, true)

            expect(parentFoundWith.mock.contexts[0]).toBe(elements.parent)
        })
    })

    describe('given WebdriverIO.Element[] type', () => {
        let elements: WebdriverIO.Element[]

        beforeEach(() => {
            elements = [elementFactory('element1'), elementFactory('element2')]
        })

        test('default should not refresh', async () => {
            const actual = await refetchElements(elements, 5, true)

            expect(actual).toEqual(elements)
            expect(actual).toHaveLength(2)
        })
    })
})
