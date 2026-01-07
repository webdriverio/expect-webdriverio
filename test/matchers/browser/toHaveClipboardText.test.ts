import { vi, test, expect } from 'vitest'
import { browser } from '@wdio/globals'

import { toHaveClipboardText } from '../../../src/matchers/browser/toHaveClipboardText'

vi.mock('@wdio/globals')

const beforeAssertion = vi.fn()
const afterAssertion = vi.fn()

test('toHaveClipboardText', async () => {
    browser.execute = vi.fn().mockResolvedValue('some clipboard text')

    const result = await toHaveClipboardText.call({}, browser, 'some ClipBoard text', { ignoreCase: true, beforeAssertion, afterAssertion })
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
