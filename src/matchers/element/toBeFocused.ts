import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { CommandOptions } from '../../publicTypes/options.js'

export async function toBeFocused(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'focused'
    const { matcherName = 'toBeFocused' } = this

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isFocused(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}
