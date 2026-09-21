import { createRequire } from 'node:module'

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

// The same file can end up loaded as more than one module instance in the same
// process (e.g. Node's require() of an ES module creates a synthetic instance
// separate from one loaded via import()). Keeping the mutable defaults on
// `globalThis`, keyed by a registered symbol, ensures setFeatureFlags() and
// setDefaultOptions() stay visible to every instance instead of only the one
// that happened to run them. The key is namespaced by major version so two
// incompatible releases loaded in the same process (e.g. a transitive
// dependency pinned to an older major) don't share state.
const { version: packageVersion } = createRequire(import.meta.url)('../package.json') as { version: string }
const packageMajorVersion = packageVersion.split('.')[0]
const GLOBAL_CONSTANTS_KEY = Symbol.for(`expect-webdriverio.constants@${packageMajorVersion}`)
const globalScope = globalThis as unknown as Record<symbol, SharedConstants>
const shared = (globalScope[GLOBAL_CONSTANTS_KEY] ??= createSharedConstants())

export const DEFAULT_FEATURE_FLAGS = shared.DEFAULT_FEATURE_FLAGS
export const DEFAULT_OPTIONS = shared.DEFAULT_OPTIONS
export const DEFAULT_OPTIONS_TO_BE_DISPLAYED = shared.DEFAULT_OPTIONS_TO_BE_DISPLAYED
export const defaultOptionsList = shared.defaultOptionsList
