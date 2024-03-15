import { vi, test, describe, expect } from 'vitest'
import { $, $$ } from '@wdio/globals'

import { wrapExpectedWithArray } from '../../src/util/elementsUtil.js'

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
})
