import { vi, expect, describe, it, beforeEach } from 'vitest'
import { browser } from '@wdio/globals'
import { toHaveLocalStorageItem } from '../../../src/matchers/browser/toHaveLocalStorageItem.js'

vi.mock('@wdio/globals')

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

describe('toHaveLocalStorageItem', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('passes when localStorage item exists with correct value', async () => {
        browser.execute = vi.fn().mockResolvedValue('someLocalStorageValue')

        const result = await toHaveLocalStorageItem.call(
            {}, // this context
            browser,
            'someLocalStorageKey',
            'someLocalStorageValue',
            { ignoreCase: true, beforeAssertion, afterAssertion }
        )

        expect(result.pass).toBe(true)

        // Check that browser.execute was called with correct arguments
        expect(browser.execute).toHaveBeenCalledWith(
            expect.any(Function),
            'someLocalStorageKey'
        )

        expect(beforeAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveLocalStorageItem',
            expectedValue: ['someLocalStorageKey', 'someLocalStorageValue'],
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })

        expect(afterAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveLocalStorageItem',
            expectedValue: ['someLocalStorageKey', 'someLocalStorageValue'],
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    it('fails when localStorage item has different value', async () => {
        browser.execute = vi.fn().mockResolvedValue('actualValue')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'someKey',
            'expectedValue'
        )

        expect(result.pass).toBe(false)
    })

    it('fails when localStorage item does not exist', async () => {
        // Mock browser.execute to return null (item doesn't exist)
        browser.execute = vi.fn().mockResolvedValue(null)

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'nonExistentKey',
            'someValue'
        )

        expect(result.pass).toBe(false)
        expect(browser.execute).toHaveBeenCalledWith(
            expect.any(Function),
            'nonExistentKey'
        )
    })

    it('passes when only checking key existence', async () => {
        // Mock browser.execute to return any non-null value
        browser.execute = vi.fn().mockResolvedValue('anyValue')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'existingKey'
            // no expectedValue parameter
        )

        expect(result.pass).toBe(true)
    })

    it('ignores case when ignoreCase is true', async () => {
        browser.execute = vi.fn().mockResolvedValue('UPPERCASE')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'key',
            'uppercase',
            { ignoreCase: true }
        )

        expect(result.pass).toBe(true)
    })

    it('trims whitespace when trim is true', async () => {
        browser.execute = vi.fn().mockResolvedValue('  value  ')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'key',
            'value',
            { trim: true }
        )

        expect(result.pass).toBe(true)
    })

    it('checks containing when containing is true', async () => {
        browser.execute = vi.fn().mockResolvedValue('this is a long value')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'key',
            'long',
            { containing: true }
        )

        expect(result.pass).toBe(true)
    })

    it('passes when localStorage value matches regex', async () => {
        browser.execute = vi.fn().mockResolvedValue('user_123')

        const result = await toHaveLocalStorageItem.call(
            {},
            browser,
            'userId',
            /^user_\d+$/
        )

        expect(result.pass).toBe(true)
    })
})