import { getGlobalSingleton } from './util/globalSingleton.js'

interface SharedConstants {
    DEFAULT_FEATURE_FLAGS: ExpectWebdriverIO.FeatureFlags
    DEFAULT_OPTIONS: Required<ExpectWebdriverIO.DefaultOptions>
    DEFAULT_OPTIONS_TO_BE_DISPLAYED: Required<Omit<ExpectWebdriverIO.ToBeDisplayedOptions, 'message' | 'some'>>
    defaultOptionsList: Required<ExpectWebdriverIO.DefaultOptions>[]
}

function createSharedConstants(): SharedConstants {
    const DEFAULT_FEATURE_FLAGS = {
        useToHaveTextStrictMultiElementsCompareStrategy: false
    }

    const DEFAULT_OPTIONS: Required<ExpectWebdriverIO.DefaultOptions> = {
        wait: 2000,
        interval: 100,
        beforeAssertion: async () => {},
        afterAssertion: async () => {},
        featureFlags: DEFAULT_FEATURE_FLAGS
    }

    const DEFAULT_OPTIONS_TO_BE_DISPLAYED: Required<Omit<ExpectWebdriverIO.ToBeDisplayedOptions, 'message' | 'some'>> = {
        ...DEFAULT_OPTIONS,
        withinViewport: false,
        contentVisibilityAuto: true,
        opacityProperty: true,
        visibilityProperty: true
    }

    return {
        DEFAULT_FEATURE_FLAGS,
        DEFAULT_OPTIONS,
        DEFAULT_OPTIONS_TO_BE_DISPLAYED,
        defaultOptionsList: [DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED]
    }
}

// See util/globalSingleton.ts for why this is shared on `globalThis` rather than
// declared as plain module-level constants: setFeatureFlags()/setDefaultOptions()
// need to stay visible to every module instance, not just the one that ran them.
const shared = getGlobalSingleton('constants', createSharedConstants)

export const DEFAULT_FEATURE_FLAGS = shared.DEFAULT_FEATURE_FLAGS
export const DEFAULT_OPTIONS = shared.DEFAULT_OPTIONS
export const DEFAULT_OPTIONS_TO_BE_DISPLAYED = shared.DEFAULT_OPTIONS_TO_BE_DISPLAYED
export const defaultOptionsList = shared.defaultOptionsList
