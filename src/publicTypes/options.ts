type ExpectLibSyncExpectationResult = import('expect').SyncExpectationResult
type ExpectLibAsyncExpectationResult = import('expect').AsyncExpectationResult
type WdioGetHTMLOptions = NonNullable<Parameters<WebdriverIO.Element['getHTML']>[0]>

/**
 * The option and result types are interfaces of the global `ExpectWebdriverIO` namespace, so that a field that a user
 * adds to a base interface (e.g. `CommandOptions`) also reaches the interfaces that extend it (e.g. `StringOptions`).
 * The module exports are aliases of them.
 */
declare global {
    namespace ExpectWebdriverIO {
        interface AssertionResult extends ExpectLibSyncExpectationResult {}
        type AsyncAssertionResult = ExpectLibAsyncExpectationResult

        interface AssertionHookParams {
            /**
             * name of the matcher, e.g. `toHaveText` or `toBeClickable`
             */
            matcherName: keyof ExpectWebdriverIO.Matchers<void, unknown>
            /**
             * Value that the user has passed in
             *
             * @example
             * ```
             * expect(el).toBeClickable() // expectedValue is undefined
             * expect(el).toHaveText('foo') // expectedValue is `'foo'`
             * expect(el).toHaveAttribute('attr', 'value', { ... }) // expectedValue is `['attr', 'value]`
             * ```
             */
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expectedValue?: any,
            /**
             * Options that the user has passed in, e.g. `expect(el).toHaveText('foo', { ignoreCase: true })` -> `{ ignoreCase: true }`
             */
            options: CommandOptions | HTMLOptions | StringOptions
        }
        interface AfterAssertionHookParams extends AssertionHookParams {
            result: AssertionResult
        }

        interface DefaultOptions {
            /**
             * time in ms to wait for expectation to succeed. Default: 2000
             */
            wait?: number

            /**
             * interval between attempts. Default: 100
             */
            interval?: number

            /**
             * hook that gets executed before each assertion
             */
            beforeAssertion?: (params: AssertionHookParams) => Promise<void>

            /**
             * hook that gets executed after each assertion, it contains the result of the assertion
             */
            afterAssertion?: (params: AfterAssertionHookParams) => Promise<void>
        }

        interface CommandOptions extends DefaultOptions {
            /**
             * user message to prepend before assertion error
             */
            message?: string
        }

        interface HTMLOptions extends StringOptions, WdioGetHTMLOptions {}

        interface StringOptions extends CommandOptions {
            /**
             * apply `toLowerCase` to both actual and expected values
             */
            ignoreCase?: boolean

            /**
             * apply `trim` to actual value
             */
            trim?: boolean

            /**
             * expect actual value to contain expected value.
             * Otherwise strict equal
             */
            containing?: boolean

            /**
             * expect actual value to start with the expected value
             * Otherwise strict equal
             */
            atStart?: boolean

            /**
             * expect actual value to end with the expected value
             * Otherwise strict equal
             */
            atEnd?: boolean

            /**
             * expect actual value to have the expected value at the given index (index starts at 0 not 1)
             * Otherwise strict equal
             */
            atIndex?: number

            /**
             * replace the actual value (example: strip newlines from the value) and expect it to match the expected value
             * Otherwise strict equal
             */
            replace?: [string | RegExp, string | Function] | Array<[string | RegExp, string | Function]>

            /**
             * convert element's property value to string
             */
            asString?: boolean
        }

        interface ToBeDisplayedOptions extends CommandOptions {
            /**
             * `true` to check if the element is within the viewport. false by default.
             */
            withinViewport?: boolean

            /**
             * `true` to check if the element content-visibility property has (or inherits) the value auto,
             * and it is currently skipping its rendering. `true` by default.
             * @default true
             */
            contentVisibilityAuto?: boolean

            /**
             * `true` to check if the element opacity property has (or inherits) a value of 0. `true` by default.
             * @default true
             */
            opacityProperty?: boolean

            /**
             * `true` to check if the element is invisible due to the value of its visibility property. `true` by default.
             * @default true
             */

            visibilityProperty?: boolean
        }
    }
}

export type AssertionResult = ExpectWebdriverIO.AssertionResult
export type AsyncAssertionResult = ExpectWebdriverIO.AsyncAssertionResult
export type AssertionHookParams = ExpectWebdriverIO.AssertionHookParams
export type AfterAssertionHookParams = ExpectWebdriverIO.AfterAssertionHookParams
export type DefaultOptions = ExpectWebdriverIO.DefaultOptions
export type CommandOptions = ExpectWebdriverIO.CommandOptions
export type HTMLOptions = ExpectWebdriverIO.HTMLOptions
export type StringOptions = ExpectWebdriverIO.StringOptions
export type ToBeDisplayedOptions = ExpectWebdriverIO.ToBeDisplayedOptions

/**
 * A number to compare with: `eq`, or a range with `gte`, `lte` or both.
 * The `never` fields reject `{}` and `eq` with a range, which TypeScript accepts for a union without them.
 */
export type NumberMatcher =
    | {
        /**
         * equals
         */
        eq: number
        gte?: never
        lte?: never
    }
    | {
        eq?: never
        /**
         * greater than or equals
         */
        gte: number
        /**
         * less than or equals
         */
        lte?: number
    }
    | {
        eq?: never
        /**
         * greater than or equals
         */
        gte?: number
        /**
         * less than or equals
         */
        lte: number
    }
