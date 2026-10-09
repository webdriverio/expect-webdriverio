import { executeCommandBe } from '../../utils.js'
import type { MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { DEFAULT_OPTIONS_TO_BE_DISPLAYED } from '../../constants.js'
import type { ToBeDisplayedOptions } from '../../publicTypes/options.js'

export async function toBeDisplayed(
    this: WdioMatcherContext,
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    options: ToBeDisplayedOptions = DEFAULT_OPTIONS_TO_BE_DISPLAYED,
) {
    this.expectation = this.expectation || 'displayed'
    const { matcherName = 'toBeDisplayed' } = this

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
