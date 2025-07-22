import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

interface ToBeDisplayedOptions {
    /**
     * `true` to check if the element is within the viewport. false by default.
     */
    withinViewport?: boolean
    /**
     * `true` to check if the element content-visibility property has (or inherits) the value auto,
     * and it is currently skipping its rendering. `true` by default.
     * @default true
     */
    contentVisibilityAuto?: boolean
    /**
     * `true` to check if the element opacity property has (or inherits) a value of 0. `true` by default.
     * @default true
     */
    opacityProperty?: boolean
    /**
     * `true` to check if the element is invisible due to the value of its visibility property. `true` by default.
     * @default true
     */
    visibilityProperty?: boolean
}

export async function toBeDisplayed(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.CommandOptions & ToBeDisplayedOptions = DEFAULT_OPTIONS
) {
    options.withinViewport ??= false
    options.contentVisibilityAuto ??= true
    options.opacityProperty ??= true
    options.visibilityProperty ??= true

    this.expectation = this.expectation || 'displayed'

    await options.beforeAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
    })

    const result = await executeCommandBe.call(this, received, el => el?.isDisplayed(), options)

    await options.afterAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
        result
    })

    return result
}
