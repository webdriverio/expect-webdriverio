import { doesNotMatch } from 'assert/strict';
import { refetchElements } from '../../src/util/refetchElements'

describe('refetchElements', () => {
    let els: WebdriverIO.ElementArray

    beforeEach(async () => {
        els = await $$('parent');
        // @ts-ignore
        els.parent._length = 5;
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
