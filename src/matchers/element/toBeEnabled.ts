import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeEnabled(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = 'enabled'
    const matcherName = 'toBeEnabled'

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}
