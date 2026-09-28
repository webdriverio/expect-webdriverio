import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'

export async function toExist(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''
    this.allowEmptyElements = true
    const { matcherName = 'toExist' } = this

    await options.beforeAssertion?.({
        matcherName,
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isExisting(), options)

    await options.afterAssertion?.({
        matcherName,
        options,
        result
    })

    return result
}

export function toBeExisting(this: WdioMatcherContext, el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, options?: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'existing'
    this.verb = 'be'
    this.matcherName = 'toBeExisting'

    return toExist.call(this, el, options)
}
export function toBePresent(this: WdioMatcherContext, el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, options?: ExpectWebdriverIO.CommandOptions) {
    this.expectation = 'present'
    this.verb = 'be'
    this.matcherName = 'toBePresent'

    return toExist.call(this, el, options)
}
