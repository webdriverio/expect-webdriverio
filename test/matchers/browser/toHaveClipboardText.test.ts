import { vi, test, expect } from 'vitest'
import { browser } from '@wdio/globals'

import { toHaveClipboardText } from '../../../src/matchers/browser/toHaveClipboardText.js'
import { toHaveClipboardTextContaining } from '../../../src/matchers/browser/toHaveClipboardTextContaining.js'

vi.mock('@wdio/globals')

test('toHaveClipboardText', async () => {
    const result = await toHaveClipboardText.call({}, browser, 'some ClipBoard text', { ignoreCase: true })
    expect(result.pass).toBe(true)
})

test('toHaveClipboardTextContaining', async () => {
    const result = await toHaveClipboardTextContaining.call({}, browser, 'pbo', { ignoreCase: true })
    expect(result.pass).toBe(true)
})
