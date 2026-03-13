import { executeCommandBe } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types.js'
import { DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../../constants.js'

export async function toBeDisplayed(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.ToBeDisplayedOptions = DEFAULT_OPTIONS_TO_BE_DISPLAYED,
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
    } = { ...DEFAULT_OPTIONS_TO_BE_DISPLAYED, ...options }

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
