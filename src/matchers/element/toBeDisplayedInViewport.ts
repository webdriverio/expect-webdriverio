import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'

export async function toBeDisplayedInViewport(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'displayed in viewport'
    const { matcherName = 'toBeDisplayedInViewport' } = this

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
