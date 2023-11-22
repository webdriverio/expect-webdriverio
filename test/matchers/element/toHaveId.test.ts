import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveId } from '../../../src/matchers/element/toHaveId.js'

vi.mock('@wdio/globals')

describe('toHaveId', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = vi.fn().mockImplementation((attribute: string) => {
            if(attribute === 'id') {
                return 'test id'
            }
            return null
        })
    })

    test('success', async () => {
        const result = await toHaveId.call({}, el, 'test id');
        expect(result.pass).toBe(true)
    });

    describe('failure', () => {
        let result: any
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()

        beforeEach(async () => {
            result = await toHaveId.call({}, el, 'an attribute', { beforeAssertion, afterAssertion });
        })

        test('failure', () => {
            expect(beforeAssertion).toBeCalledWith({
                matcherName: 'toHaveId',
                expectedValue: 'an attribute',
                options: { beforeAssertion, afterAssertion }
            })
            expect(result.pass).toBe(false)
            expect(afterAssertion).toBeCalledWith({
                matcherName: 'toHaveId',
                expectedValue: 'an attribute',
                options: { beforeAssertion, afterAssertion },
                result
            })
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
