// The global `ExpectWebdriverIO` namespace and types, for a user who imports only this entry point
import '../publicTypes/expectWebdriverIO.js'
import { some as wdioSome } from '../matchers/modifiers/some.js'
import { multiRemote as wdioMultiRemote } from '../matchers/asymmetrics/multiRemote.js'

/**
 * API allowing to export some feature without the burden of all the initilizations
 */

/**
 * Quantifier modifier. Wraps a `$$()` result so that the matcher passes
 * when at least one element satisfies the condition (∃ semantics).
 *
 * @example
 * await expect(some($$('.items'))).toBeDisplayed()
 * await expect(some($$('.items'))).not.toBeDisplayed() // at least one is NOT displayed
 * await expect(some($$('.items'))).toHaveText('foo')
 */
export const some: <T extends ElementArrayLike>(elements: T) => WdioSome<T> = wdioSome

/**
 * One expected value per multi-remote instance, keyed by instance name. Same as `expect.multiRemote()`.
 *
 * @example
 * await expect(multiRemoteBrowser.$('h1')).toHaveStyle(multiRemote({ chrome: { color: 'red' }, firefox: { color: 'blue' } }))
 */
export const multiRemote: <T>(values: MultiRemoteValues<T>) => ExpectWebdriverIO.MultiRemotePartialMatcher<T> = wdioMultiRemote
export { wdioCustomMatcherNames, asymmetricMatcherNames, inverseAsymmetricMatcherNames } from './matcherNames.js'
