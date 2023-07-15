import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveElementClassContaining } from '../../../src/matchers/element/toHaveClassContaining.js'

vi.mock('@wdio/globals')

describe('toHaveElementClassContaining', () => {
    let el: WebdriverIO.Element

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = vi.fn().mockImplementation((attribute: string) => {
            if(attribute === 'class') {
                return 'some-class another-class'
            }
            return null
        })
    })

    test('success when whole class name is present', async () => {
        const result = await toHaveElementClassContaining.call({}, el, "some-class");
        expect(result.pass).toBe(true)
    });

    test('success when part of class name is present', async () => {
        const result = await toHaveElementClassContaining.call({}, el, "other");
        expect(result.pass).toBe(true)
    });

    describe('failure when class name is not present', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveElementClassContaining.call({}, el, "test");
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute class')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('test')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('some-class another-class')
            })
        })
    });
});
