import { waitUntil, enhanceError } from '../../utils'

export function toHaveChildren(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    const eq = options.eq
    const gte = options.gte || 1
    const lte = options.lte || 0

    return browser.call(async () => {
        el = await el
        let children = []
        const pass = await waitUntil(async () => {
            children = await el.$$('./*')

            if (typeof eq === 'number') {
                return children.length === length
            }

            if (lte > 0 && children.length > lte) {
                return false
            }

            return children.length >= gte
        }, isNot, options)

        let error = ''
        if (typeof eq !== 'number') {
            error = `>= ${gte}`
            error += lte ? ` && <= ${lte}` : ''
        } else {
            error += eq
        }

        const message = enhanceError(el, error, '' + children.length, isNot, verb, expectation, '', options)

        return {
            pass,
            message: () => message
        }
    })
}
