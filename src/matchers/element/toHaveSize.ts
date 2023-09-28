import {
    waitUntil,
    enhanceError,
    compareText,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
    compareObject,
} from '../../utils.js'

import type { RectReturn } from '@wdio/protocols'
import type { Size } from 'webdriverio/build/commands/element/getSize.js'

async function condition(
    el: WebdriverIO.Element,
    size: Size | number | string,
    options: ExpectWebdriverIO.SizeOptions = {}
): Promise<any> {
    const { asJSONString = false } = options

    const actualSize = await el.getSize(options.property as keyof RectReturn)
    
    if (typeof actualSize === 'number' && typeof size === 'number') {
        return {
            value: actualSize,
            result: actualSize === size
        }
    }

    if (typeof size === 'string' && asJSONString) {
        return compareText(JSON.stringify(actualSize), size, options)
    }

    return compareObject(actualSize, size)
}

export async function toHaveSize(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    size: Size | number | string,
    options: ExpectWebdriverIO.SizeOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'size', verb = 'have' } = this

    let el = await received
    let actualSize

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [size, options])

            el = result.el
            actualSize = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualSize, size),
        actualSize,
        this,
        verb,
        expectation,
        '',
        options
    )

    return {
        pass,
        message: (): string => message,
    }
}
