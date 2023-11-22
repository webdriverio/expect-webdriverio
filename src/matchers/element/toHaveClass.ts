import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { waitUntil, enhanceError, executeCommand, wrapExpectedWithArray, updateElementsArray, compareText } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

async function condition(el: WebdriverIO.Element, attribute: string, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions) {
    const { ignoreCase = false, trim = false, containing = false } = options

    let attr = await el.getAttribute(attribute)
    if (typeof attr !== 'string') {
        return { result: false }
    }

    if (trim) {
        attr = attr.trim()
    }
    if (ignoreCase) {
        attr = attr.toLowerCase()
        if (typeof value === 'string') {
            value = value.toLowerCase()
        }
    }

    const classes = attr.split(' ')

    const valueInClasses = classes.some((t) => {
        return value instanceof RegExp
            ? !!t.match(value)
            : containing && typeof value === 'string'
                ? t.includes(value)
                : compareText(t, value, options).result
    })
    return {
        value: attr,
        result: valueInClasses
    }
}

/**
 * @deprecated
 */
export function toHaveClass(...args: any): any {
    return toHaveElementClass.call(this || {}, ...args)
}

export async function toHaveElementClass(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher,
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

    let el = await received
    let attr

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [attribute, expectedValue, options])
        el = result.el
        attr = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

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
export function toHaveElementClassContaining (...args: any) {
    return toHaveClassContaining.call(this, ...args)
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
