import { vi, test, expect, describe } from 'vitest'
import { browser } from '@wdio/globals'

import { toHaveClipboardText } from '../../../src/matchers/browser/toHaveClipboardText'

vi.mock('@wdio/globals')

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

describe(toHaveClipboardText, () => {
    test('success', async () => {
        browser.execute = vi.fn().mockResolvedValue('some clipboard text')

        const result = await toHaveClipboardText(browser, 'some ClipBoard text', { ignoreCase: true, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toBeCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some ClipBoard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toBeCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some ClipBoard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('failure check with message', async () => {
        browser.execute = vi.fn().mockResolvedValue('actual text')

        const result = await toHaveClipboardText(browser, 'expected text', { wait: 1 })

        expect(result.pass).toBe(false)
        expect(result.message()).toEqual(`\
Expect browser to have clipboard text

Expected: "expected text"
Received: "actual text"`
        )
    })

    test('should log warning if setPermissions fails', async () => {
        browser.execute = vi.fn().mockResolvedValue('text')
        vi.mocked(browser.setPermissions).mockRejectedValueOnce(new Error('unsupported'))

        const result = await toHaveClipboardText(browser, 'text', { wait: 0 })

        expect(result.pass).toBe(true)
        expect(browser.setPermissions).toHaveBeenCalledWith({ name: 'clipboard-read' }, 'granted')
    })
})
