import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveId } from '../../../src/matchers/element/toHaveId';

vi.mock('@wdio/globals')

describe('toHaveHref', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = vi.fn().mockImplementation((attribute: string) => {
            if(attribute === 'id') {
                return "test id"
            }
            return null
        })
    })

    test('success', async () => {
        const result = await toHaveId(el, "test id");
        expect(result.pass).toBe(true)
    });

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveId(el, "an attribute");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute id')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('an attribute')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('test id')
            })
        })
    });

});
