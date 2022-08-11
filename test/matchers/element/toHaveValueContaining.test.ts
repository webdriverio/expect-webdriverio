import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils';
import { toHaveValueContaining } from '../../../src/matchers/element/toHaveValueContaining'

vi.mock('@wdio/globals')

describe('toHaveValueContaining', () => {
    let el: any

    beforeEach(async () => {
        el = await $('sel')
        el._value = vi.fn().mockImplementation(() => {
            return "This is an example value"
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveValueContaining(el, "This is an example value");
            expect(result.pass).toBe(true)
        });
        test('part passes', async () => {
            const result = await toHaveValueContaining(el, "example value");
            expect(result.pass).toBe(true)
        });
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveValueContaining(el, "webdriver");
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have property value')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example value')
            })
        })
    });

});
