import { executeCommandBe } from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

const DEFAULT_OPTIONS_DISPLAYED: ExpectWebdriverIO.ToBeDisplayedOptions = {
    ...DEFAULT_OPTIONS,
    withinViewport: false,
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true
}

export async function toBeDisplayed(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.ToBeDisplayedOptions = DEFAULT_OPTIONS_DISPLAYED,
) {
    this.expectation = this.expectation || 'displayed'

    await options.beforeAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
    })

    const {
        withinViewport,
        contentVisibilityAuto,
        opacityProperty,
        visibilityProperty,
        ...commandOptions
    } = { ...DEFAULT_OPTIONS_DISPLAYED, ...options }

    const result = await executeCommandBe.call(this, received, el => el?.isDisplayed({
        withinViewport,
        contentVisibilityAuto,
        opacityProperty,
        visibilityProperty
    }), commandOptions)

    await options.afterAssertion?.({
        matcherName: 'toBeDisplayed',
        options,
        result
    })

    return result
}
