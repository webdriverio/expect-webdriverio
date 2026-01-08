import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise } from '../../types.js'

export async function toExist(
    received: WdioElementOrArrayMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''
    this.matcherName = this.matcherName || 'toExist'

    await options.beforeAssertion?.({
        matcherName: this.matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isExisting(), options)

    await options.afterAssertion?.({
        matcherName: this.matcherName,
        options,
        result
    })

    return result
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    this.verb = 'be'
    this.expectation = 'existing'
    this.matcherName = 'toBeExisting'
    return toExist.call(this, el, options)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    this.verb = 'be'
    this.expectation = 'present'
    this.matcherName = 'toBePresent'
    return toExist.call(this, el, options)
}
