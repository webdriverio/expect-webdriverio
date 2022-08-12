import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveTextContaining } from '../../../src/matchers/element/toHaveTextContaining.js'

vi.mock('@wdio/globals')

describe('toHaveTextContaining', () => {
    let el: any

    beforeEach(async () => {
        el = await $('sel')
        el._text = vi.fn().mockImplementation(() => {
            return "This is example text"
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveTextContaining(el, "This is example text");
            expect(result.pass).toBe(true)
        });

        test('part passes', async () => {
            const result = await toHaveTextContaining(el, "example text");
            expect(result.pass).toBe(true)
        })

        test('RegExp passes', async () => {
            const result = await toHaveTextContaining(el, /ExAmplE/i);
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveTextContaining(el, "webdriver");
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have text containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is example text')
            })
        })
    });

    describe('failure with RegExp', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveTextContaining(el, /Webdriver/i);
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have text containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/Webdriver/i')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is example text')
            })
        })
    });
});
