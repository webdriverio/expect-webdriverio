import { getAsymmetricMatcherValue, isAsymmetricMatcher } from '../../utils.js'
import { oneOfWithContext } from './oneOfWithContext.js'

/**
 * Jest's expect.extend, when registering asymmetric matchers, use a CustomMatcher class to register them on the expect object, which gives no customization or hook at all.
 * Replacing the asymmetric matcher at runtime inside our matchers, given more flexibility and control over the behavior of the asymmetric matcher, especially when it comes to passing options to the asymmetric matcher.
 * @param expectedValue
 */
export const buildWdioAsymmetricMatchers = <T>(expectedValue: T, options?: ExpectWebdriverIO.StringOptions) => {
    if (isAsymmetricMatcher(expectedValue) && expectedValue.toString() === 'oneOf') {
        const asymmetricMatcherValue = getAsymmetricMatcherValue(expectedValue)

        if (Array.isArray(asymmetricMatcherValue)) {
            return oneOfWithContext(asymmetricMatcherValue, options)
        }
    }
    return expectedValue
}
