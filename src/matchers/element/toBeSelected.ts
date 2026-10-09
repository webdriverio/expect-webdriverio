import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CommandOptions } from '../../publicTypes/options.js'

export async function toBeSelected(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'selected'
    const { matcherName = 'toBeSelected' } = this

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isSelected(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}

export async function toBeChecked (this: WdioMatcherContext, received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, options: CommandOptions = DEFAULT_OPTIONS) {
    this.expectation = 'checked'
    this.matcherName ??= 'toBeChecked'

    const result = await toBeSelected.call(this, received, options)

    return result
}
