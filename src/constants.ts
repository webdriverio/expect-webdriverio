export const DEFAULT_OPTIONS: Required<ExpectWebdriverIO.DefaultOptions> = {
    wait: 2000,
    interval: 100,
    beforeAssertion: async () => {},
    afterAssertion: async () => {},
}
