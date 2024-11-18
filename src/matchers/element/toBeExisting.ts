import { executeCommandBe, aliasFn } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toExist(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    await options.beforeAssertion?.({
        matcherName: 'toExist',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isExisting(), options)

    await options.afterAssertion?.({
        matcherName: 'toExist',
        options,
        result
    })

    return result
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'existing' }, el, options)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'present' }, el, options)
}
