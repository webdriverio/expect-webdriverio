import { getBrowserObject, executeCommandBe } from '../../utils'
import { runExpect } from '../../util/expectAdapter'

async function toBeFocusedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}) {
    this.expectation = this.expectation || 'focused'

    const browser = getBrowserObject(await received)

    return browser.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isFocused(), options)
        return result
    })
}

export function toBeFocused(...args: any): any {
    return runExpect.call(this || {}, toBeFocusedFn, args)
}
