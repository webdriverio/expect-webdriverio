import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeDisplayed(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'displayed'

    await options.beforeAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isDisplayed(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
        result
    })

    return result
}
