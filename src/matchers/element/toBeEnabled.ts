import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CommandOptions } from '../../publicTypes/options.js'

export async function toBeEnabled(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'enabled'
    const { matcherName = 'toBeEnabled' } = this

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
