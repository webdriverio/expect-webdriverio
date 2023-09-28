import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveComputedRoleContaining } from '../../../src/matchers/element/toHaveComputedRoleContaining.js'

vi.mock('@wdio/globals')

describe('toHaveComputedRoleContaining', () => {
    let el: any

    beforeEach(async () => {
        el = await $('sel')
        el._computed_role = vi.fn().mockImplementation(() => {
            return 'This is an example of a computed role'
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveComputedRoleContaining.call(
                {},
                el,
                'This is an example of a computed role'
            )
            expect(result.pass).toBe(true)
        })

        test('part passes', async () => {
            const result = await toHaveComputedRoleContaining.call({}, el, 'example of a computed role')
            expect(result.pass).toBe(true)
        })

        test('RegExp passes', async () => {
            const result = await toHaveComputedRoleContaining.call({}, el, /ExAmplE/i)
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveComputedRoleContaining.call({}, el, 'webdriver')
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have computed role containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example of a computed role')
            })
        })
    })

    describe('failure with RegExp', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveComputedRoleContaining.call({}, el, /Webdriver/i)
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have computed role containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/Webdriver/i')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('This is an example of a computed role')
            })
        })
    })
})
