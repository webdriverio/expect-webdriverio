
import { executeCommandBe } from '../../utils'

export function toBeClickable(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'clickable'

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isClickable().catch(() => false), options)
        return result
    })
}
