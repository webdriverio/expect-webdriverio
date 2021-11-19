import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { executeCommandBe } from '../../utils'
import { runExpect, getContext } from '../../util/expectAdapter'


function toBeSelectedFn(received: WebdriverIO.Element | WebdriverIO.ElementArray, options: ExpectWebdriverIO.CommandOptions = {}, driver?: WebdriverIO.Browser): any {
    this.expectation = this.expectation || 'selected'

    const browserToUse: WebdriverIO.Browser = driver ?? browser;
    return browserToUse.call(async () => {
        const result = await executeCommandBe.call(this, received, el => el.isSelected(), options)
        return result
    })
}

export function toBeSelected(...args: any): any {
    return runExpect.call(this, toBeSelectedFn, args)
}

export function toBeChecked (el: WebdriverIO.Element, options: ExpectWebdriverIO.CommandOptions, driver?: WebdriverIO.Browser): any {
    const context = getContext(this)
    context.expectation = 'checked'
    return toBeSelected.call(context, el, options, driver)
}
