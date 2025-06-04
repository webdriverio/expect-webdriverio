import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareText,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    property: string,
    value: unknown,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { asString = false } = options

    let prop = await el.getProperty(property)
    if (prop === null || prop === undefined) {
        return { result: false, value: prop }
    }

    if (value === null) {
        return { result: true, value: prop }
    }

    if (!(value instanceof RegExp) && typeof prop !== 'string' && !asString) {
        return { result: prop === value, value: prop }
    }

    prop = prop.toString()
    return compareText(prop as string, value as string | RegExp | ExpectWebdriverIO.PartialMatcher, options)
}

export async function toHaveElementProperty(
    received: WdioElementMaybePromise,
    property: string,
    value?: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'property', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveElementProperty',
        expectedValue: [property, value],
        options,
    })

    let el = await received?.getElement()
    let prop: unknown
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [property, value])
            el = result.el as WebdriverIO.Element
            prop = result.values

            return result.success
        },
        isNot,
        options
    )

    let message: string
    if (value === undefined) {
        message = enhanceError(el, !isNot, pass, this, verb, expectation, property, options)
    } else {
        const expected = wrapExpectedWithArray(el, prop, value)
        message = enhanceError(el, expected, prop, this, verb, expectation, property, options)
    }

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveElementProperty',
        expectedValue: [property, value],
        options,
        result
    })

    return result
}
