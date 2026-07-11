import { vi, test, expect, describe, beforeEach } from 'vitest'
import { browser } from '@wdio/globals'

import { toHaveClipboardText } from '../../../src/matchers/browser/toHaveClipboardText'
import stripAnsi from 'strip-ansi'

vi.mock('@wdio/globals')

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

describe(toHaveClipboardText, () => {
    let thisContext: { toHaveClipboardText: typeof toHaveClipboardText }
    let thisNotContext: { isNot: true,  toHaveClipboardText: typeof toHaveClipboardText }

    beforeEach(async () => {
        thisContext = { toHaveClipboardText }
        thisNotContext = { isNot: true, toHaveClipboardText }
    })

    test('success', async () => {
        vi.mocked(browser.execute).mockResolvedValue('some clipboard text')

        const result = await thisContext.toHaveClipboardText(browser, 'some ClipBoard text', { ignoreCase: true, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(true)
        expect(beforeAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some ClipBoard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some ClipBoard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('failure check with message', async () => {
        vi.mocked(browser.execute).mockResolvedValue('actual text')

        const result = await thisContext.toHaveClipboardText(browser, 'expected text')

        expect(result.pass).toBe(false)
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser to have clipboard text

Expected: "expected text"
Received: "actual text"`
        )
    })

    test('should log warning if setPermissions fails', async () => {
        vi.mocked(browser.execute).mockResolvedValue('text')
        vi.mocked(browser.setPermissions).mockRejectedValueOnce(new Error('unsupported'))

        const result = await thisContext.toHaveClipboardText(browser, 'text', { wait: 0 })

        expect(result.pass).toBe(true)
        expect(browser.setPermissions).toHaveBeenCalledWith({ name: 'clipboard-read' }, 'granted')
    })
    test('success with isNot true', async () => {
        vi.mocked(browser.execute).mockResolvedValue('some clipboard text')

        const result = await thisNotContext.toHaveClipboardText(browser, 'some other clipboard text', { ignoreCase: true, beforeAssertion, afterAssertion })
        expect(result.pass).toBe(false) // success, boolean is inverted later because of `.not`
        expect(beforeAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some other clipboard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion }
        })
        expect(afterAssertion).toHaveBeenCalledWith({
            matcherName: 'toHaveClipboardText',
            expectedValue: 'some other clipboard text',
            options: { ignoreCase: true, beforeAssertion, afterAssertion },
            result
        })
    })

    test('failure check with message with isNot true', async () => {
        vi.mocked(browser.execute).mockResolvedValue('actual text')

        const result = await thisNotContext.toHaveClipboardText(browser, 'actual text')

        expect(result.pass).toBe(true) // failure, boolean is inverted later because of `.not`
        expect(stripAnsi(result.message())).toEqual(`\
Expect browser not to have clipboard text

Expected [not]: "actual text"
Received      : "actual text"`
        )
    })
})
