import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toBeDisplayedInViewport(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = 'displayed in viewport'
    const matcherName = 'toBeDisplayedInViewport'

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isDisplayed({ withinViewport: true }), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}
