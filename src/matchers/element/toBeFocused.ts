import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'

export async function toBeFocused(
    received: WdioElementOrArrayMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'focused'

    await options.beforeAssertion?.({
        matcherName: 'toBeFocused',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isFocused(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeFocused',
        options,
        result
    })

    return result
}
