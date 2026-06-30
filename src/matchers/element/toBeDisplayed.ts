import { executeCommandBe } from '../../utils.js'
import type { WdioElementMaybePromise } from '../../types.js'
import { DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../../constants.js'

export async function toBeDisplayed(
    received: WdioElementMaybePromise,
    options: ExpectWebdriverIO.ToBeDisplayedOptions = DEFAULT_OPTIONS_TO_BE_DISPLAYED,
) {
    this.expectation = 'displayed'
    const matcherName = 'toBeDisplayed'

    await options.beforeAssertion?.({
        matcherName,
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
        matcherName,
        options,
        result
    })

    return result
}
