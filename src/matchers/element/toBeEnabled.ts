import { executeCommandBe } from '../../utils.js'

export async function toBeEnabled(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'enabled'

    await options.beforeAssertion?.({
        matcherName: 'toBeEnabled',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeEnabled',
        options,
        result
    })

    return result
}
