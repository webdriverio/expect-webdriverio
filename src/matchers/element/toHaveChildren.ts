import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import { isDefinedObject, isStrictlyCommandOptions } from '../../util/commandOptionsUtils.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedValue: NumberMatcher) {
    const children = await el.$$('./*').getElements()

    return {
        result: expectedValue.match(children?.length),
        value: children?.length
    }
}

/**
 * @deprecated Passing explicit `undefined` or `{}` as a value is deprecated. Omit the second argument entirely or use `toHaveChildren(el, options)`.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: undefined, // {} also deprecated but we cannot use it as a type because it would match any object
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AsyncAssertionResult>

/**
 * When called with only configuration options (omitting the expected count) where default is gte 1.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AsyncAssertionResult>

/**
 * When called with an expected child count or number options.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AsyncAssertionResult>

/**
 * @deprecated since 5.7.1, NumberOptions is no longer supported. Use `toHaveChildren(el, numberMatcher, options)` instead.
 */
export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AsyncAssertionResult>

export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValueOrOptions: number | ExpectWebdriverIO.NumberMatcher | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.CommandOptions | undefined,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
): Promise<ExpectWebdriverIO.AsyncAssertionResult> {
    const matcherName = 'toHaveChildren'
    const { expectation = 'children', verb = 'have', isNot } = this

    // Extract beforeAssertion and afterAssertion from either expectedValueOrOptions or options, done before isStrictlyCommandOptions check to ensure we stay backward compatible with deprecated NumberOptions usage. To remove in next major version.
    const beforeAssertion = ( isDefinedObject(expectedValueOrOptions) && 'beforeAssertion' in expectedValueOrOptions ? expectedValueOrOptions.beforeAssertion ?? options.beforeAssertion : options.beforeAssertion)
    const afterAssertion = ( isDefinedObject(expectedValueOrOptions) && 'afterAssertion' in expectedValueOrOptions ? expectedValueOrOptions.afterAssertion ?? options.afterAssertion : options.afterAssertion )

    // New case where second argument is strictly the options object, and no expected value is provided.
    if (isStrictlyCommandOptions(expectedValueOrOptions)) {
        options =  expectedValueOrOptions
        expectedValueOrOptions = undefined // Let's fake an omitted expected to undefined for now.
    }

    await beforeAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
    })

    // After the beforeAssertion hook, so backward compatibility is kept when expectedValueOrOptions is undefined instead of default value. To change on next major?
    const { numberMatcher: expectedValue, commandOptions } = validateNumberAndExtractOptions(expectedValueOrOptions, options, true)

    let el = await received?.getElement()
    let children
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, commandOptions, [expectedValue])
        el = result.el as WebdriverIO.Element
        children = result.values

        return result.success
    },
    isNot,
    { wait: commandOptions.wait, interval: commandOptions.interval })

    const expectedArray = wrapExpectedWithArray(el, children, expectedValue)
    const message = enhanceError(el, expectedArray, children, this, verb, expectation, '', commandOptions)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await afterAssertion?.({
        matcherName,
        expectedValue: expectedValueOrOptions,
        options,
        result
    })

    return result
}
