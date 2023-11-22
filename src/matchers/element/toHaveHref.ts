import { toHaveAttributeAndValue } from './toHaveAttribute.js'

export async function toHaveHref(el: WebdriverIO.Element, expectedValue: string, options: ExpectWebdriverIO.StringOptions = {}) {
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
export function toHaveHrefContaining(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveHref.call(this, el, href, {
        ...options,
        containing: true
    })
}

/**
 * @deprecated
 */
export const toHaveLinkContaining = toHaveHrefContaining
