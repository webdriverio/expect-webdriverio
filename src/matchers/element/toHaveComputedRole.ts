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
    role: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
    options: ExpectWebdriverIO.StringOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'computed role', verb = 'have' } = this

    let el = await received
    let actualRole

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [role, options])
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
        wrapExpectedWithArray(el, actualRole, role),
        actualRole,
        this,
        verb,
        expectation,
        '',
        options
    )

    return {
        pass,
        message: (): string => message,
    }
}
