import { executeCommandBe } from '../../utils.js'

export function toBeDisplayedInViewport(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed in viewport'

    return executeCommandBe.call(this, received, async el => {
        try {
            return el.isDisplayedInViewport()
        } catch {
            return false
        }
    }, options)
}
