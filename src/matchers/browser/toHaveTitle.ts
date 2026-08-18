import { waitUntil, enhanceError, compareText, isAsymmetricMatcher } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { StrategyResult } from '../../util/executeCommand.js'

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveTitle(
    this: ExpectWebdriverIO.MatcherContext,
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'title', verb = 'have', isNot, matcherName = 'toHaveTitle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { actual, success } = await waitUntil(
        async () => {

            if (browser.isMultiremote) {
                return await compareMultiRemoteTitles(browser, expectedValue, options)
            } else if (typeof expectedValue === 'object' || Array.isArray(expectedValue) && !isAsymmetricMatcher(expectedValue)) {
                throw new Error('Expected value object or array is not supported for a single browser instance. Use a string, RegExp or asymmetric matcher instead.')
            } else {
                return await compareBrowserTitle(browser, expectedValue, options)
            }
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError('window', expectedValue, actual, { isNot }, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass: success,
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

const compareBrowserTitle = async (
    browser: WebdriverIO.Browser,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions
): Promise<StrategyResult<string>> => {
    const actual = await browser.getTitle()
    const result = compareText(actual, expectedValue, options)
    return { actual: result.actual, success: result.success, subject: browser }
}

const compareMultiRemoteTitles = async (
    browser: WebdriverIO.MultiRemoteBrowser,
    expectedValue: MaybeArrayOrMultiRemoteValues<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions
): Promise<StrategyResult<MaybeArray<string>>> => {
    let browserNames: string[] | undefined
    let expectedValues: MaybeArray<string | RegExp | AsymmetricMatcher<string>> | undefined

    if (typeof expectedValue === 'object' && !Array.isArray(expectedValue) && !isAsymmetricMatcher(expectedValue) && !(expectedValue instanceof RegExp)) {
        browserNames = Object.keys(expectedValue)
        if (browserNames.length === 0) {
            throw new Error('Expected value object is empty. Please provide at least one browser instance name with its expected title.')
        }

        expectedValues = Object.values(expectedValue)
    } else {
        expectedValues = expectedValue
    }

    // @ts-expect-error working only with yalc
    const actual = await (browserNames ? browser.select(browserNames) : browser).getTitle()

    if (Array.isArray(actual)){
        const results = actual.map((title, index) => compareText(title, Array.isArray(expectedValues) ? expectedValues[index] : expectedValues, options))
        return { actual: results.map(r => r.actual), success: results.every(r => r.success), subject: browser }
    } else if (Array.isArray(expectedValues)) {
        throw new Error('Expected value is an array but actual value is not. Please provide a single expected value for a single browser instance.')
    }

    const result = compareText(actual, expectedValues, options)
    return { ...result, subject: browser }

}

