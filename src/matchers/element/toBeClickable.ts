import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CommandOptions } from '../../publicTypes/options.js'

export async function toBeClickable(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'clickable'
    const { matcherName = 'toBeClickable' } = this

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isClickable(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}
