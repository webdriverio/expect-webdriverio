import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import { compareText, compareTextWithArray, enhanceError, executeCommand, isAsymmeyricMatcher, waitUntil, wrapExpectedWithArray } from '../../utils.js'
import { toHaveAttributeAndValue } from './toHaveAttribute.js'

async function condition(el: WebdriverIO.Element, attribute: string, value: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions) {
    const actualClass = await el.getAttribute(attribute)
    if (typeof actualClass !== 'string') {
        return { result: false }
    }

    /**
     * if value is an asymmetric matcher, no need to split class names
     * into an array and compare each of them
     */
    if (isAsymmeyricMatcher(value)) {
        return compareText(actualClass, value, options)
    }

    const classes = actualClass.split(' ')
    const isValueInClasses = classes.some((t) => {
        return Array.isArray(value)
            ? compareTextWithArray(t, value, options).result
            : compareText(t, value, options).result
    })

    return {
        value: actualClass,
        result: isValueInClasses
    }
}

/**
 * @deprecated
 */
export function toHaveClass(...args: unknown[]) {
    return toHaveElementClass.call(this || {}, ...args)
}

export async function toHaveElementClass(
    received: WdioElementMaybePromise,
    expectedValue: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'class', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveElementClass',
        expectedValue,
        options,
    })

    const attribute = 'class'

    let el = await received?.getElement()
    let attr

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [attribute, expectedValue, options])
        el = result.el as WebdriverIO.Element
        attr = result.values

        return result.success
    }, isNot, options)

    const message = enhanceError(el, wrapExpectedWithArray(el, attr, expectedValue), attr, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveElementClass',
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * @deprecated
 */
export function toHaveClassContaining(el: WebdriverIO.Element, className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS) {
    return toHaveAttributeAndValue.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}
