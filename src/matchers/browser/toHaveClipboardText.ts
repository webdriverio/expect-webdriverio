import { waitUntil, enhanceError, compareText } from '../../utils.js'
import logger from '@wdio/logger'

const log = logger('expect-webdriverio')

export async function toHaveClipboardText(browser: WebdriverIO.Browser, clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'clipboard text', verb = 'have' } = this

    let actual
    const pass = await waitUntil(async () => {
        await browser.setPermissions({ name: 'clipboard-read' }, 'granted')
            /**
             * changes are that some browser don't support the clipboard API yet
             */
            .catch((err) => log.warn(`Couldn't set clipboard permissions: ${err}`))
        actual = await browser.execute(() => window.navigator.clipboard.readText())
        return compareText(actual, clipboardText, options).result
    }, isNot, options)

    const message = enhanceError('browser', clipboardText, actual, this, verb, expectation, '', options)
    return {
        pass,
        message: () => message
    }
}
