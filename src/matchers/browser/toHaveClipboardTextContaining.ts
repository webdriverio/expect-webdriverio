import { toHaveClipboardText } from './toHaveClipboardText.js'

export function toHaveClipboardTextContaining(browser: WebdriverIO.Browser, clipboardText: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveClipboardText.call(this, browser, clipboardText, {
        ...options,
        containing: true
    })
}
