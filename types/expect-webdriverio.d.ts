/* eslint-disable @typescript-eslint/consistent-type-imports*/
type ServiceInstance =  import('@wdio/types').Services.ServiceInstance
type Test = import('@wdio/types').Frameworks.Test
type TestResult = import('@wdio/types').Frameworks.TestResult
type PickleStep = import('@wdio/types').Frameworks.PickleStep
type Scenario = import('@wdio/types').Frameworks.Scenario
type SnapshotResult = import('@vitest/snapshot').SnapshotResult
type SnapshotUpdateState = import('@vitest/snapshot').SnapshotUpdateState
type ExpectLibAsymmetricMatchers = import('expect').AsymmetricMatchers
type ChainablePromiseElement = import('webdriverio').ChainablePromiseElement
type ChainablePromiseArray = import('webdriverio').ChainablePromiseArray
type ExpectLibAsymmetricMatcher<T> = import('expect').AsymmetricMatcher<T>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PromiseLikeType = Promise<any>
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

interface WdioBrowserMatchers<R, T = unknown>{
    /**
     * `WebdriverIO.Browser` -> `getUrl`
     */
    toHaveUrl: T extends WebdriverIO.Browser ? (url: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>: never;

    /**
     * `WebdriverIO.Browser` -> `getTitle`
     */
    toHaveTitle: T extends WebdriverIO.Browser ? (title: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>: never;

    /**
     * `WebdriverIO.Browser` -> `execute`
     */
    toHaveClipboardText: T extends WebdriverIO.Browser ? (clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>: never;
}

type MockPromise = Promise<WebdriverIO.Mock>
interface WdioMockMatchers<R, T = unknown> {
    /**
     * Check that `WebdriverIO.Mock` was called
     */
    toBeRequested: T extends MockPromise ? (options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never
    /**
     * Check that `WebdriverIO.Mock` was called N times
     */
    toBeRequestedTimes: T extends MockPromise ? (
        times: number | ExpectWebdriverIO.NumberOptions,
        options?: ExpectWebdriverIO.NumberOptions
    ) => Promise<R> : never

    /**
     * Check that `WebdriverIO.Mock` was called with the specific parameters
     */
    toBeRequestedWith: T extends MockPromise ? (requestedWith: ExpectWebdriverIO.RequestedWith, options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never
}

/**
 * Note we are defining Matchers outside of the namespace as done in jest library until we can make every typing work correctly.
 * Once we have all types working, we could check to bring those back into the `ExpectWebdriverIO` namespace.
 */

// TODO dprevost have browser matchers and element matchers separated
// TODO extending extends Record<string, any> remove ts error on unimplemented matchers

// TODO dprevost - check if custom matchers (https://webdriver.io/docs/custommatchers/) will still work aka webdriverio/expect-webdriverio#1408
type ElementOrArrayLike = ElementLike | ElementArrayLike
type ElementLike = WebdriverIO.Element | ChainablePromiseElement
type ElementArrayLike = WebdriverIO.ElementArray | ChainablePromiseArray
interface WdioCustomMatchers<R, T = unknown> {
    // ===== $ or $$ =====
    /**
     * `WebdriverIO.Element` -> `isDisplayed`
     */
    toBeDisplayed: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toExist: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBePresent: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBeExisting: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.CommandOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttribute: T extends ElementOrArrayLike ? (
        attribute: string,
        value?: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttr: T extends ElementOrArrayLike ? (
        attribute: string,
        value?: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
     */
    toHaveClass: T extends ElementOrArrayLike ? (
        className: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     *
     * Checks if an element has the specified class or matches any of the provided class patterns.
     * @param className - The class name(s) or pattern(s) to match against.
     * @param options - Optional settings that can be passed to the function.
     *
     * **Usage**
     * ```js
     * // Check if an element has the class 'btn'
     * await expect(element).toHaveElementClass('btn');
     *
     * // Check if an element has any of the specified classes
     * await expect(element).toHaveElementClass(['btn', 'btn-large']);
     * ```
     */
    toHaveElementClass: T extends ElementOrArrayLike ? (
        className: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getProperty`
     */
    toHaveElementProperty: T extends ElementOrArrayLike ? (
        property: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        value?: unknown,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveValue: T extends ElementOrArrayLike ? (
        value: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isClickable`
     */
    toBeClickable: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `!isEnabled`
     */
    toBeDisabled: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isDisplayedInViewport`
     */
    toBeDisplayedInViewport: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isEnabled`
     */
    toBeEnabled: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isFocused`
     */
    toBeFocused: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeSelected: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeChecked: T extends ElementOrArrayLike ? (options?: ExpectWebdriverIO.StringOptions) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `$$('./*').length`
     * supports less / greater then or equals to be passed in options
     */
    toHaveChildren: T extends ElementOrArrayLike ? (
        size?: number | ExpectWebdriverIO.NumberOptions,
        options?: ExpectWebdriverIO.NumberOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveHref: T extends ElementOrArrayLike ? (
        href: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveLink: T extends ElementOrArrayLike ? (
        href: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveId: T extends ElementOrArrayLike ? (
        id: string | RegExp | ExpectWebdriverIO.PartialMatche<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getSize` value
     */
    toHaveSize: T extends ElementOrArrayLike ? (
        size: { height: number; width: number },
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getText`
     * Element's text equals the text provided
     *
     * @param text - The expected text to match.
     * @param options - Optional settings that can be passed to the function.
     *
     * **Usage**
     *
     * ```js
     * // Check if an element has the text
     * const elem = await $('.container')
     * await expect(elem).toHaveText('Next-gen browser and mobile automation test framework for Node.js')
     *
     * // Check if an element array contains the specified text
     * const elem = await $$('ul > li')
     * await expect(elem).toHaveText(['Coffee', 'Tea', 'Milk'])
     * ```
     */
    toHaveText: T extends ElementOrArrayLike ? (text: string | RegExp | ExpectWebdriverIO.PartialMatcher<string> | Array<string | RegExp | ExpectWebdriverIO.PartialMatcher<string>>) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getHTML`
     * Element's html equals the html provided
     */
    toHaveHTML: T extends ElementOrArrayLike ? (
        html: string | RegExp | ExpectWebdriverIO.PartialMatcher<T> | Array<string | RegExp>,
        options?: ExpectWebdriverIO.HTMLOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getComputedLabel`
     * Element's computed label equals the computed label provided
     */
    toHaveComputedLabel: T extends ElementOrArrayLike ? (
        computedLabel: string | RegExp | ExpectWebdriverIO.PartialMatcher<T>| Array<string | RegExp>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getComputedRole`
     * Element's computed role equals the computed role provided
     */
    toHaveComputedRole: T extends ElementOrArrayLike ? (
        computedRole: string | RegExp | ExpectWebdriverIO.PartialMatcher<T>| Array<string | RegExp>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getSize('width')`
     * Element's width equals the width provided
     */
    toHaveWidth: T extends ElementOrArrayLike ? (
        width: number,
        options?: ExpectWebdriverIO.CommandOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getSize('height')`
     * Element's height equals the height provided
     */
    toHaveHeight: T extends ElementOrArrayLike ? (
        height: number,
        options?: ExpectWebdriverIO.CommandOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getSize()`
     * Element's size equals the size provided
     */
    toHaveHeight: T extends ElementOrArrayLike ? (
        size: { height: number; width: number },
        options?: ExpectWebdriverIO.CommandOptions
    ) => Promise<R> : never

    /**
     * `WebdriverIO.Element` -> `getAttribute("style")`
     */
    toHaveStyle: T extends ElementOrArrayLike ? (
        style: { [key: string]: string },
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R> : never

    // ===== $$ only =====
    /**
     * `WebdriverIO.ElementArray` -> `$$('...').length`
     * supports less / greater then or equals to be passed in options
     */
    toBeElementsArrayOfSize: T extends ElementArrayLike ? (
        size: number | ExpectWebdriverIO.NumberOptions,
        options?: ExpectWebdriverIO.NumberOptions
    ) => Promise<R> & Promise<WebdriverIO.ElementArray> : never
}

/**
 * Those need to be also duplicated in jest.d.ts in order for the typing to correctly overload the matchers (we cannot just extend the Matchers interface)
 */
interface WdioOverloadedMatchers<R> {
    /**
     * snapshot matcher
     * @param label optional snapshot label
     */
    toMatchSnapshot(label?: string): Promise<R>
    /**
     * inline snapshot matcher
     * @param snapshot snapshot string (autogenerated if not specified)
     * @param label optional snapshot label
     */
    toMatchInlineSnapshot(snapshot?: string, label?: string): Promise<R>
}

interface WdioMatchers<R, T = unknown> extends WdioOverloadedMatchers<R, T>, WdioBrowserMatchers<R, T>, WdioCustomMatchers<R, T>, WdioMockMatchers<R, T> {}

type WdioAsymmetricMatchers = ExpectLibAsymmetricMatchers

/**
 * Implementation of the asymmetric matcher. Equivalent as he PartialMatcher but with sample used by implementations.
 * // TODO dprevost - might be needed in the namespace for custom matchers implementation?
 */
type WdioAsymmetricMatcher<T> = ExpectWebdriverIO.PartialMatcher<T> & {
    // Overwrite protected properties of expect.AsymmetricMatcher to access them
    sample: T;
}

/**
 * expect function declaration, containing two generics:
 *  - T: the type of the actual value, e.g. any type, not just WebdriverIO.Browser or WebdriverIO.Element
 *  - R: the type of the return value, e.g. Promise<void> or void
 */
// TODO dprevost should we extends Expect from expect lib or just AsyncMatchers?
// TODO dprevost ExpectLibAsymmetricMatchers add arrayOf and closeTo previously not there! and not was there previously but is no more?
interface WdioCustomExpect extends WdioAsymmetricMatchers {
    /**
     * Creates a soft assertion wrapper around standard expect
     * Soft assertions record failures but don't throw errors immediately
     * All failures are collected and reported at the end of the test
     */
    soft<T = unknown>(actual: T): T extends PromiseLikeType ? Matchers<Promise<void>, T> : Matchers<void, T>

    /**
     * Get all current soft assertion failures
     */
    getSoftFailures(testId?: string): SoftFailure[]

    /**
     * Manually assert all soft failures (throws an error if any failures exist)
     */
    assertSoftFailures(testId?: string): void

    /**
     * Clear all current soft assertion failures
     */
    clearSoftFailures(testId?: string): void
}

declare namespace ExpectWebdriverIO {
    function setOptions(options: DefaultOptions): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getConfig(): any

    interface SnapshotServiceArgs {
        updateState?: SnapshotUpdateState
        resolveSnapshotPath?: (path: string, extension: string) => string
    }

    class SnapshotService {
        static initiate(options: SnapshotServiceArgs): ServiceInstance & {
            results: SnapshotResult[]
        }
    }

    interface SoftFailure {
        error: Error
        matcherName: string
        location?: string
    }

    class SoftAssertService {
        static getInstance(): SoftAssertService
        setCurrentTest(testId: string, testName?: string, testFile?: string): void
        clearCurrentTest(): void
        getCurrentTestId(): string | null
        addFailure(error: Error, matcherName: string): void
        getFailures(testId?: string): SoftFailure[]
        clearFailures(testId?: string): void
        assertNoFailures(testId?: string): void
    }

    interface SoftAssertionServiceOptions {
        autoAssertOnTestEnd?: boolean
    }

    class SoftAssertionService implements ServiceInstance {
        constructor(serviceOptions?: SoftAssertionServiceOptions, capabilities?: unknown, config?: un)
        beforeTest(test: Test): void
        beforeStep(step: PickleStep, scenario: Scenario): void
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterTest(test: Test, context: any, result: TestResult): void
        afterStep(step: PickleStep, scenario: Scenario, result: { passed: boolean, error?: Error }): void
    }

    interface AssertionResult {
        pass: boolean
        message(): string
    }

    // TODO dprevost - to review
    // const matchers: Map<
    //     string,
    //     (
    //         actual: any,
    //         ...expected: any[]
    //     ) => Promise<AssertionResult>
    // >

    interface AssertionHookParams {
        /**
         * name of the matcher, e.g. `toHaveText` or `toBeClickable`
         */
        matcherName: keyof Matchers<void, unknown>,
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
        options: CommandOptions | HTMLOptions | StringOptions | NumberOptions
    }
    interface AfterAssertionHookParams extends AssertionHookParams {
        result: AssertionResult
    }

    interface DefaultOptions {
        /**
         * time in ms to wait for expectation to succeed. Default: 3000
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

    interface HTMLOptions extends StringOptions {
        /**
         * return the HTML with the selector tag included
         */
        includeSelectorTag?: boolean
    }

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
         * might be helpful to force converting property value to string
         */
        asString?: boolean
    }

    interface NumberOptions extends CommandOptions {
        /**
         * equals
         */
        eq?: number
        /**
         * less than or equals
         */
        lte?: number

        /**
         * greater than or equals
         */
        gte?: number
    }

    type RequestedWith = {
        url?: string | ExpectWebdriverIO.PartialMatcher<string>| ((url: string) => boolean)
        method?: string | Array<string>
        statusCode?: number | Array<number>
        requestHeaders?:
            | Record<string, string>
            | ExpectWebdriverIO.PartialMatcher<Record<string, string>>
            | ((headers: Record<string, string>) => boolean)
        responseHeaders?:
            | Record<string, string>
            | ExpectWebdriverIO.PartialMatcher<Record<string, string>>
            | ((headers: Record<string, string>) => boolean)
        postData?:
            | string
            | ExpectWebdriverIO.JsonCompatible
            | ExpectWebdriverIO.PartialMatcher<string | ExpectWebdriverIO.JsonCompatible>
            | ((r: string | undefined) => boolean)
        response?:
            | string
            | ExpectWebdriverIO.JsonCompatible<string | JsonCompatible>
            | ExpectWebdriverIO.PartialMatcher
            | ((r: string) => boolean)
    }

    type jsonPrimitive = string | number | boolean | null
    type jsonObject = { [x: string]: jsonPrimitive | jsonObject | jsonArray }
    type jsonArray = Array<jsonPrimitive | jsonObject | jsonArray>
    type JsonCompatible = jsonObject | jsonArray

    /**
     * Allow to partially matches value. Same as asymmetric matcher in jest.
     * Some properties are omitted for the type check to work correctly.
     */
    type PartialMatcher<T> = Omit<ExpectLibAsymmetricMatcher<T>, 'sample' | 'inverse' | '$$typeof'>
}

declare module 'expect-webdriverio' {
    export = ExpectWebdriverIO
}
