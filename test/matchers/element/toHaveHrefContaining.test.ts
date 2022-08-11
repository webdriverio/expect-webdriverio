import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils';
import { toHaveHrefContaining } from '../../../src/matchers/element/toHaveHrefContaining';

vi.mock('@wdio/globals')

describe('toHaveHrefContaining', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = vi.fn().mockImplementation((attribute: string) => {
            if(attribute === 'href') {
                return "https://www.example.com"
            }
            return null
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveHrefContaining(el, "https://www.example.com");
            expect(result.pass).toBe(true)
        });

        test('part passes', async () => {
            const result = await toHaveHrefContaining(el, "example");
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHrefContaining(el, "webdriver");
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute href containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('https://www.example.com')
            })
        })
    });

});
