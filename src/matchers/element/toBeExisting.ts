import { executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

export function toExist(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    return runExpect.call(this, toExistFn, arguments)
}

function toExistFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, async el => {
            try {
                return el.isExisting()
            } catch {
                return false
            }
        }, options)
        return result
    })
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'existing' }, el, options)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions) {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'present' }, el, options)
}
