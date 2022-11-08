import { getFirstElement, getBrowserObject, executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toExistFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    const el = await getFirstElement(received)
    const browser = getBrowserObject(el)

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

export function toExist(...args: any): any {
    return runExpect.call(this || {}, toExistFn, args)
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'existing' }, el, options)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'present' }, el, options)
}
