import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveAttrContaining } from '../../../src/matchers/element/toHaveAttributeContaining';

vi.mock('@wdio/globals')

describe('toHaveAttributeContaining', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
    })

    test('success when contains', async () => {
        el.getAttribute = vi.fn().mockImplementation(() => {
            return "An example phrase"
        })
        const result = await toHaveAttrContaining(el, "attribute_name", "example");
        expect(result.pass).toBe(true)
    });

    describe('failure when doesnt contain', () => {
        let result: any

        beforeEach(async () => {
            el.getAttribute = vi.fn().mockImplementation(() => {
                return "An example phrase"
            })
            result = await toHaveAttrContaining(el, "attribute_name", "donkey");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('donkey')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('An example phrase')
            })
        })
    });

});
