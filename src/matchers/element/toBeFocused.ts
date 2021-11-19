import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

function toBeFocusedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'focused'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isFocused(), options)
        return result
    })
}

export function toBeFocused(...args: any): any {
    return runExpect.call(this, toBeFocusedFn, args)
}
