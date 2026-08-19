import { MultiRemoteValuesMatcher } from '../matchers/asymmetrics/multiRemoteValuesMatcher.js'
import { isOneOfMatcher } from '../matchers/asymmetrics/oneOf.js'
import type { CompareResult, StrategyResult } from './executeCommand.js'
import { isMultiRemoteValues } from './multiRemoteUtils.js'

export async function executeBrowserCommand<Actual, Expected>( {
    browser,
    expectedValue,
    compare,
    multiRemoteCompare,
} :{
    browser: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser
    expectedValue: MaybeArrayOrMultiRemoteValues<Expected> | Expected | unknown
    compare: (browser: WebdriverIO.Browser, expectedValue: Expected | unknown, index?: number) => Promise<CompareResult<Actual>>
    multiRemoteCompare: (browser: WebdriverIO.MultiRemoteBrowser, expectedValue: ArrayOrMultiRemoteValues<Expected> | unknown, index?: number) => Promise<CompareResult<ArrayOrMultiRemoteValues<Actual>>>
}
): Promise<StrategyResult<ArrayOrMultiRemoteValues<Actual> | Actual>> {

    let results: CompareResult<ArrayOrMultiRemoteValues<Actual>> | CompareResult<Actual>
    let subject: WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser = browser
    let expected: MaybeArrayOrMultiRemoteValues<Expected> | unknown = expectedValue

    if (browser.isMultiremote) {
        let multiRemoteBrowser: WebdriverIO.MultiRemoteBrowser = browser

        if (isMultiRemoteValues(expectedValue)) {
            // TODO review to be better
            const multiRemoteValuesMatcher = new MultiRemoteValuesMatcher(expectedValue as Record<string, string | RegExp | AsymmetricMatcher<string>>)
            // @ts-expect-error working only with yalc
            multiRemoteBrowser = browser.select(multiRemoteValuesMatcher.browserNames)
            expected = multiRemoteValuesMatcher
        } else if (Array.isArray(expectedValue) || isOneOfMatcher(expectedValue)) {
            expected = expectedValue
        } else {
            expected = Array(browser.instances.length).fill(expectedValue)
        }

        results = await multiRemoteCompare(multiRemoteBrowser, expected)
        subject = multiRemoteBrowser
    } else if (isMultiRemoteValues(expectedValue) || Array.isArray(expectedValue)) {
        // TODO review if this is accurate!
        throw new Error('Expected value object or array is not supported for a single browser instance. Use a string, RegExp or asymmetric matcher instead.')
    } else {
        results = await compare(browser, expectedValue)
    }
    return { ...results, subject, expected }
}
