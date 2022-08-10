import { vi, beforeEach, test, describe, expect } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { updateElementsArray, wrapExpectedWithArray } from '../../src/util/elementsUtil'
import { refetchElements } from '../../src/util/refetchElements'

vi.mock('@wdio/globals')

describe('elementsUtil', () => {
    describe('wrapExpectedWithArray', () => {
        test('is not array ', async () => {
            const el = await $('sel')
            const actual = wrapExpectedWithArray(el, "Test Actual", "Test Expected")
            expect(actual).toEqual("Test Expected")
        })

        test('is array ', async () => {
            const els = await $$('sel')
            const actual = wrapExpectedWithArray(els, ["Test Actual", "Test Actual"], "Test Expected")
            expect(actual).toEqual(["Test Expected"])
        })
    })

    describe('updateElementsArray', () => {
        let received: WebdriverIO.ElementArray,
            refetched: WebdriverIO.ElementArray

        beforeEach(async () => {
            // Fetches element array of size 2
            received = await $$('parent');
            // @ts-ignore
            received.parent._length = 5;
            // Only size 5 when refetched (useful for testing)
            refetched = await refetchElements(received, 5, true)
        })

        test('is not success', () => {
            updateElementsArray(false, received, refetched)
            expect(received.length).toBe(2)
        })

        test('full', () => {
            updateElementsArray(true, received, refetched, true)
            expect(received.length).toBe(5)
        })
    })
})
