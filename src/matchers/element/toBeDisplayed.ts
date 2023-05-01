import { executeCommandBe } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeDisplayed(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'displayed'

    return executeCommandBe.call(this, received, async el => {
        try {
            return el.isDisplayed()
        } catch {
            return false
        }
    }, options)
}
