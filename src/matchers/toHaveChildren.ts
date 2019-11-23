import { waitUntil, enhanceError, getSelectors } from '../utils'

export function toHaveChildren(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions = {}) {
    const isNot = this.isNot

    const gte = options.gte || 1
    const lte = options.lte || 0

    return browser.call(async () => {
        el = await el

        let children = []
        const pass = await waitUntil(async () => {
            children = await el.$$('./*')

            if (lte > 0 && children.length > lte) {
                return false
            }

            return children.length >= gte
        }, isNot, options)

        let error = !pass ? ` but expected to have at least ${gte}` : ''
        error += !pass && lte ? ` and no more than ${lte}` : ''
        const message = enhanceError(`Element "${getSelectors(el)}" has ${children.length} children${error}.`, options)

        return {
            pass,
            message: () => message
        }
    })
}
