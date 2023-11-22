import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export async function toHaveHref(
    el: WebdriverIO.Element,
    expectedValue: string,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
    })

    const result = await toHaveAttributeAndValue.call(this, el, 'href', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
        result
    })

    return result
}

export const toHaveLink = toHaveHref

/**
 * @deprecated
 */
export function toHaveHrefContaining(
    el: WebdriverIO.Element,
    href: string,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveHref.call(this, el, href, {
        ...options,
        containing: true
    })
}

/**
 * @deprecated
 */
export const toHaveLinkContaining = toHaveHrefContaining
