import { executeCommandBe } from '../../utils.js'

export function toBeClickable(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'clickable'

    return executeCommandBe.call(this, received, async el => {
        try {
            return el.isClickable()
        } catch {
            return false
        }
    }, options)
}
