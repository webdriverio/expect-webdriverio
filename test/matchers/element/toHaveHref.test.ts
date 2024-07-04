import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getExpected, getReceived } from '../../__fixtures__/utils.js'
import { toHaveHref } from '../../../src/matchers/element/toHaveHref.js'

vi.mock('@wdio/globals')

describe('toHaveHref', () => {
    let el: ChainablePromiseElement

    beforeEach(async () => {
        el = await $('sel')
        el.getAttribute = vi.fn().mockImplementation((attribute: string) => {
            if(attribute === 'href') {
                return 'https://www.example.com'
            }
            return null
        })
    })

    test('success when contains', async () => {
        const beforeAssertion = vi.fn()
        const afterAssertion = vi.fn()
        const result = await toHaveHref.call({}, el, 'https://www.example.com', { beforeAssertion, afterAssertion });
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveHref',
            expectedValue: 'https://www.example.com',
            options: { beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveHref',
            expectedValue: 'https://www.example.com',
            options: { beforeAssertion, afterAssertion },
            result
        })
    });

    describe('failure when doesnt contain', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHref.call({}, el, 'an href');
        })

        test('failure', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have attribute href')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('an href')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('https://www.example.com')
            })
        })
    })
})
