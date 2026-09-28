import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'

export async function toBeDisabled(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'disabled'
    const { matcherName = 'toBeDisabled' } = this

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, async el => !await el.isEnabled(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}
