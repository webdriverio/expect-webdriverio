import { vi, test, describe, beforeEach, expect } from 'vitest'
import { $$ } from '@wdio/globals'

import { refetchElements } from '../../src/util/refetchElements.js'

vi.mock('@wdio/globals')

describe('refetchElements', () => {
    let els: WebdriverIO.ElementArray

    beforeEach(async () => {
        els = await $$('parent')
        // @ts-ignore
        els.parent._length = 5
    })

    test('default', async () => {
        const actual = await refetchElements(els, 5, true)
        expect(actual.length).toBe(5)
    })

    test('wait is 0', async () => {
        const actual = await refetchElements(els, 0, true)
        expect(actual).toEqual(els)
    })
})
