import { executeCommandBe } from '../../utils.js'

export async function toBeClickable(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'clickable'

    await options.beforeAssertion?.({
        matcherName: 'toBeClickable',
        options,
    })

    const result = await executeCommandBe.call(this, received, async el => {
        try {
            return el.isClickable()
        } catch {
            return false
        }
    }, options)

    await options.afterAssertion?.({
        matcherName: 'toBeClickable',
        options,
        result
    })

    return result
}
