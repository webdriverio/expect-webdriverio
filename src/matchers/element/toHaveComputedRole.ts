import {
    waitUntil,
    enhanceError,
    compareText,
    compareTextWithArray,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils.js'

async function condition(
    el: WebdriverIO.Element,
    role: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
    options: ExpectWebdriverIO.HTMLOptions
) {
    const actualRole = await el.getComputedRole()
    if (Array.isArray(role)) {
        return compareTextWithArray(actualRole, role, options)
    }
    return compareText(actualRole, role, options)
}

export async function toHaveComputedRole(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'computed role', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveComputedRole',
        expectedValue,
        options,
    })

    let el = await received
    let actualRole

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
            el = result.el
            actualRole = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualRole, expectedValue),
        actualRole,
        this,
        verb,
        expectation,
        '',
        options
    )

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveComputedRole',
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * @deprecated
 */
export function toHaveComputedRoleContaining(el: WebdriverIO.Element, role: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveComputedRole.call(this, el, role, {
        ...options,
        containing: true
    })
}
