import { executeCommandBe } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types'

export function toBeDisabled(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'disabled'
    return executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)
}
