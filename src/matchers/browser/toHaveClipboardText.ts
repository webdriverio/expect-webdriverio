import logger from '@wdio/logger'

import { waitUntil, enhanceError, compareTextOrOneOf } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { CompareResult } from '../../util/executeCommand.js'
import { executeBrowserCommand } from '../../util/executeBrowserCommand.js'

const log = logger('expect-webdriverio')

/**
 * Browser
 */
export async function toHaveClipboardText(
    browser: WebdriverIO.Browser,
    expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

/**
 * Multi-Remote Browser
 */
export async function toHaveClipboardText(
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveClipboardText(
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'clipboard text', verb = 'have', isNot, matcherName = 'toHaveClipboardText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { actual, success: pass, subject, expected } = await waitUntil(
        async () => {
            return await executeBrowserCommand({
                browser,
                expectedValue,
                compare: (
                    browser, expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined
                ) => compareClipboardText(browser, expectedValue, options),
            })
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(subject, expected, actual, this, verb, expectation, '', options)
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

const compareClipboardText = async (
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string> | undefined,
    options: ExpectWebdriverIO.StringOptions
): Promise<CompareResult<string>> => {
    await browser.setPermissions({ name: 'clipboard-read' }, 'granted')
        // chances are that some browsers don't support the clipboard API yet
        .catch((err) => log.warn(`Couldn't set clipboard permissions: ${err}`))

    const actual = await browser.execute(() => window.navigator.clipboard.readText())

    return compareTextOrOneOf(actual, expectedValue, options)
}
