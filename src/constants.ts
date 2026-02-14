export const DEFAULT_OPTIONS: Required<ExpectWebdriverIO.DefaultOptions> = {
    wait: 2000,
    interval: 100,
    beforeAssertion: async () => {},
    afterAssertion: async () => {},
}

export const DEFAULT_OPTIONS_TO_BE_DISPLAYED: Required<Omit<ExpectWebdriverIO.ToBeDisplayedOptions, 'message'>> = {
    ...DEFAULT_OPTIONS,
    withinViewport: false,
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true
}

export const defaultOptionsList = [
    DEFAULT_OPTIONS,
    DEFAULT_OPTIONS_TO_BE_DISPLAYED
]
