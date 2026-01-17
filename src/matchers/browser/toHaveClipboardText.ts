import logger from '@wdio/logger'

import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

const log = logger('expect-webdriverio')

export async function toHaveClipboardText(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'clipboard text', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveClipboardText',
        expectedValue,
        options,
    })

    let actual
    const pass = await waitUntil(async () => {
        await browser.setPermissions({ name: 'clipboard-read' }, 'granted')
            /**
             * changes are that some browser don't support the clipboard API yet
             */
            .catch((err) => log.warn(`Couldn't set clipboard permissions: ${err}`))
        actual = await browser.execute(() => window.navigator.clipboard.readText())
        return compareText(actual, expectedValue, options).result
    }, options)

    const message = enhanceError('browser', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveClipboardText',
        expectedValue,
        options,
        result
    })

    return result
}
