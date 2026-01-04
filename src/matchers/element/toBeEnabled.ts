import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'

export async function toBeEnabled(
    received: WdioElementOrArrayMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'enabled'

    await options.beforeAssertion?.({
        matcherName: 'toBeEnabled',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeEnabled',
        options,
        result
    })

    return result
}
