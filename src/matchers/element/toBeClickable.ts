import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeClickable(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'clickable'

    await options.beforeAssertion?.({
        matcherName: 'toBeClickable',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isClickable(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeClickable',
        options,
        result
    })

    return result
}
