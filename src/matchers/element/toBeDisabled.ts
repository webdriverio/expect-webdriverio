import { executeCommandBe } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeDisabled(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'disabled'

    await options.beforeAssertion?.({
        matcherName: 'toBeDisabled',
        options,
    })

    const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeDisabled',
        options,
        result
    })

    return result
}
