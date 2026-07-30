import logger from '@wdio/logger'

import { waitUntil, enhanceError, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

const log = logger('expect-webdriverio')

export async function toHaveClipboardText(
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'clipboard text', verb = 'have', isNot, matcherName = 'toHaveClipboardText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { actual, success: pass } = await waitUntil(
        async () => {
            await browser.setPermissions({ name: 'clipboard-read' }, 'granted')
                // chances are that some browsers don't support the clipboard API yet
                .catch((err) => log.warn(`Couldn't set clipboard permissions: ${err}`))
            const actual = await browser.execute(() => window.navigator.clipboard.readText())

            const compareResult = compareText(actual, expectedValue, options)
            return  { actual, success: compareResult.result, subject: browser }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError('browser', expectedValue, actual, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: () => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
