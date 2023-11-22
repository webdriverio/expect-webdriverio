import { executeCommandBe } from '../../utils.js'

export async function toBeDisplayedInViewport(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed in viewport'

    await options.beforeAssertion?.({
        matcherName: 'toBeDisplayedInViewport',
        options,
    })

    const result = await executeCommandBe.call(this, received, async el => {
        try {
            return el.isDisplayedInViewport()
        } catch {
            return false
        }
    }, options)

    await options.afterAssertion?.({
        matcherName: 'toBeDisplayedInViewport',
        options,
        result
    })

    return result
}
