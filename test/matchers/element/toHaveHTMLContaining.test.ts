import { vi, test, describe, expect, beforeEach } from 'vitest'
import { $ } from '@wdio/globals'

import { getExpectMessage, getReceived, getExpected } from '../../__fixtures__/utils.js'
import { toHaveHTMLContaining } from '../../../src/matchers/element/toHaveHTMLContaining.js'

vi.mock('@wdio/globals')

describe('toHaveHTMLContaining', () => {
    let el: any

    beforeEach(async () => {
        el = await $('sel')
        el._html = vi.fn().mockImplementation(() => {
            return '<div>foo</div>'
        })
    })

    describe('success', () => {
        test('exact passes', async () => {
            const result = await toHaveHTMLContaining.call({}, el, '<div>foo</div>')
            expect(result.pass).toBe(true)
        })

        test('part passes', async () => {
            const result = await toHaveHTMLContaining.call({}, el, 'foo')
            expect(result.pass).toBe(true)
        })

        test('RegExp passes', async () => {
            const result = await toHaveHTMLContaining.call({}, el, /foo/i)
            expect(result.pass).toBe(true)
        })
    })

    describe('failure', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHTMLContaining.call({}, el, 'webdriver')
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have HTML containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('webdriver')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('<div>foo</div>')
            })
        })
    })

    describe('failure with RegExp', () => {
        let result: any

        beforeEach(async () => {
            result = await toHaveHTMLContaining.call({}, el, /Webdriver/i)
        })

        test('does not pass', () => {
            expect(result.pass).toBe(false)
        })

        describe('message shows correctly', () => {
            test('expect message', () => {
                expect(getExpectMessage(result.message())).toContain('to have HTML containing')
            })
            test('expected message', () => {
                expect(getExpected(result.message())).toContain('/Webdriver/i')
            })
            test('received message', () => {
                expect(getReceived(result.message())).toContain('<div>foo</div>')
            })
        })
    })
})
