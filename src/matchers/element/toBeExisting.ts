import { executeCommandBe, aliasFn } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toExist(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    await options.beforeAssertion?.({
        matcherName: 'toExist',
        options,
    })

    const result = await executeCommandBe.call(this, received, async el => {
        try {
            return el.isExisting()
        } catch {
            return false
        }
    }, options)

    await options.afterAssertion?.({
        matcherName: 'toExist',
        options,
        result
    })

    return result
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'existing' }, el, options)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'present' }, el, options)
}
