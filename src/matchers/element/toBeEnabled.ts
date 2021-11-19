import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeEnabledFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'enabled'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isEnabled(), options)
        return result
    })
}

export function toBeEnabled(...args: any): any {
    return runExpect.call(this, toBeEnabledFn, args)
}
