import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'

export async function toExist(
    received: WdioElementOrArrayMaybePromise,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    await options.beforeAssertion?.({
        matcherName: 'toExist', // TODO use this.matcher =  this.matcher || toExist in v6.0.0 to fix matcherName issue with toBeExisting and toBePresent
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

export function toBeExisting(el: WdioElementOrArrayMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'existing'
    this.verb = 'be'

    return toExist.call(this, el, options)
}
export function toBePresent(el: WdioElementOrArrayMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'present'
    this.verb = 'be'

    return toExist.call(this, el, options)
}
