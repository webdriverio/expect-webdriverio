import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe, aliasFn } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toExistFn(received: WdioElementMaybePromise, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'exist'
    this.verb = this.verb || ''

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
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
    return runExpect.call(this, toExistFn, args)
}

export function toBeExisting(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions, driver?: WebdriverIO.Browser): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'existing' }, el, options, driver)
}
export function toBePresent(el: WdioElementMaybePromise, options?: ExpectWebdriverIO.CommandOptions, driver?: WebdriverIO.Browser): any {
    return aliasFn.call(this, toExist, { verb: 'be', expectation: 'present' }, el, options, driver)
}
