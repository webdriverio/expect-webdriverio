import { getGlobalSingleton } from './util/globalSingleton.js'
import type { DefaultOptions, ToBeDisplayedOptions } from './publicTypes/options.js'

interface SharedConstants {
    DEFAULT_OPTIONS: Required<DefaultOptions>
    DEFAULT_OPTIONS_TO_BE_DISPLAYED: Required<Omit<ToBeDisplayedOptions, 'message' | 'some'>>
    defaultOptionsList: Required<DefaultOptions>[]
}

function createSharedConstants(): SharedConstants {
    const DEFAULT_OPTIONS: Required<DefaultOptions> = {
        wait: 2000,
        interval: 100,
        beforeAssertion: async () => {},
        afterAssertion: async () => {},
    }

    const DEFAULT_OPTIONS_TO_BE_DISPLAYED: Required<Omit<ToBeDisplayedOptions, 'message' | 'some'>> = {
        ...DEFAULT_OPTIONS,
        withinViewport: false,
        contentVisibilityAuto: true,
        opacityProperty: true,
        visibilityProperty: true
    }

    return {
        DEFAULT_OPTIONS,
        DEFAULT_OPTIONS_TO_BE_DISPLAYED,
        defaultOptionsList: [DEFAULT_OPTIONS, DEFAULT_OPTIONS_TO_BE_DISPLAYED]
    }
}

// See util/globalSingleton.ts for why this is shared on `globalThis` rather than
// declared as plain module-level constants: setDefaultOptions()
// need to stay visible to every module instance, not just the one that ran them.
const shared = getGlobalSingleton('constants', createSharedConstants)

export const DEFAULT_OPTIONS = shared.DEFAULT_OPTIONS
export const DEFAULT_OPTIONS_TO_BE_DISPLAYED = shared.DEFAULT_OPTIONS_TO_BE_DISPLAYED
export const defaultOptionsList = shared.defaultOptionsList
