// A user's custom matchers and options, added as https://webdriver.io/docs/custommatchers/#typescript-support shows
declare global {
    namespace ExpectWebdriverIO {
        interface Matchers<R, T> {
            toBeCustomWdio(expected: string): R
            // Only on an element
            toBeCustomElement: T extends WebdriverIO.Element ? () => Promise<R> : never
        }
        interface AsymmetricMatchers {
            toBeCustomAsymmetric(expected: string): ExpectWebdriverIO.PartialMatcher<string>
        }
        interface CommandOptions {
            customOption?: string
        }
    }
}

export {}
