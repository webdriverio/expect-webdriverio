/* eslint-disable @typescript-eslint/consistent-type-imports*/
type ServiceInstance =  import('@wdio/types').Services.ServiceInstance
type Test = import('@wdio/types').Frameworks.Test
type TestResult = import('@wdio/types').Frameworks.TestResult
type PickleStep = import('@wdio/types').Frameworks.PickleStep
type Scenario = import('@wdio/types').Frameworks.Scenario
type SnapshotResult = import('@vitest/snapshot').SnapshotResult
type SnapshotUpdateState = import('@vitest/snapshot').SnapshotUpdateState

declare namespace ExpectWebdriverIO {
    const expect: ExpectWebdriverIO.Expect
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(serviceOptions?: SoftAssertionServiceOptions, capabilities?: any, config?: any)
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

    const matchers: Map<
        string,
        (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            actual: any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...expected: any[]
        ) => Promise<AssertionResult>
    >

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T> {
        // ===== $ or $$ =====
        /**
         * `WebdriverIO.Element` -> `isDisplayed`
         */
        toBeDisplayed(options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        toExist(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        toBePresent(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        toBeExisting(options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute`
         */
        toHaveAttribute(
            attribute: string,
            value?: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         */
        toHaveAttr(attribute: string, value?: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
         */
        toHaveClass(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

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
         * await expect(element).toHaveElementClass('btn')
         *
         * // Check if an element has any of the specified classes
         * await expect(element).toHaveElementClass(['btn', 'btn-large'])
         * ```
         */
        toHaveElementClass(className: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty`
         */
        toHaveElementProperty(
            property: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value?: any,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveValue(value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isClickable`
         */
        toBeClickable(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `!isEnabled`
         */
        toBeDisabled(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isDisplayedInViewport`
         */
        toBeDisplayedInViewport(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isEnabled`
         */
        toBeEnabled(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isFocused`
         */
        toBeFocused(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isSelected`
         */
        toBeSelected(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `isSelected`
         */
        toBeChecked(options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `$$('./*').length`
         * supports less / greater then or equals to be passed in options
         */
        toHaveChildren(
            size?: number | ExpectWebdriverIO.NumberOptions,
            options?: ExpectWebdriverIO.NumberOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         */
        toHaveHref(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         */
        toHaveLink(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveId(id: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getSize` value
         */
        toHaveSize(size: { height: number; width: number }, options?: ExpectWebdriverIO.StringOptions): R

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
        toHaveText(
            text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp | ExpectWebdriverIO.PartialMatcher>,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getHTML`
         * Element's html equals the html provided
         */
        toHaveHTML(html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options?: ExpectWebdriverIO.HTMLOptions): R

        /**
         * `WebdriverIO.Element` -> `getComputedLabel`
         * Element's computed label equals the computed label provided
         */
        toHaveComputedLabel(
            computedLabel: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getComputedRole`
         * Element's computed role equals the computed role provided
         */
        toHaveComputedRole(
            computedRole: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getSize('width')`
         * Element's width equals the width provided
         */
        toHaveWidth(width: number, options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `getSize('height')`
         * Element's height equals the height provided
         */
        toHaveHeight(height: number, options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `getSize()`
         * Element's size equals the size provided
         */
        toHaveHeight(size: { height: number; width: number }, options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute("style")`
         */
        toHaveStyle(style: { [key: string]: string }, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getUrl`
         */
        toHaveUrl(url: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Browser` -> `getTitle`
         */
        toHaveTitle(title: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Browser` -> `execute`
         */
        toHaveClipboardText(clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        // ===== $$ only =====
        /**
         * `WebdriverIO.ElementArray` -> `$$('...').length`
         * supports less / greater then or equals to be passed in options
         */
        toBeElementsArrayOfSize(
            size: number | ExpectWebdriverIO.NumberOptions,
            options?: ExpectWebdriverIO.NumberOptions
        ): R & Promise<WebdriverIO.ElementArray>

        // ==== network mock ====
        /**
         * Check that `WebdriverIO.Mock` was called
         */
        toBeRequested(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * Check that `WebdriverIO.Mock` was called N times
         */
        toBeRequestedTimes(
            times: number | ExpectWebdriverIO.NumberOptions,
            options?: ExpectWebdriverIO.NumberOptions
        ): R
        /**
         * Check that `WebdriverIO.Mock` was called with the specific parameters
         */
        toBeRequestedWith(requestedWith: RequestedWith, options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * snapshot matcher
         * @param label optional snapshot label
         */
        toMatchSnapshot(label?: string): R
        /**
         * inline snapshot matcher
         * @param snapshot snapshot string (autogenerated if not specified)
         * @param label optional snapshot label
         */
        toMatchInlineSnapshot(snapshot?: string, label?: string): R
    }

    type RequestedWith = {
        url?: string | ExpectWebdriverIO.PartialMatcher | ((url: string) => boolean)
        method?: string | Array<string>
        statusCode?: number | Array<number>
        requestHeaders?:
            | Record<string, string>
            | ExpectWebdriverIO.PartialMatcher
            | ((headers: Record<string, string>) => boolean)
        responseHeaders?:
            | Record<string, string>
            | ExpectWebdriverIO.PartialMatcher
            | ((headers: Record<string, string>) => boolean)
        postData?:
            | string
            | ExpectWebdriverIO.JsonCompatible
            | ExpectWebdriverIO.PartialMatcher
            | ((r: string | undefined) => boolean)
        response?:
            | string
            | ExpectWebdriverIO.JsonCompatible
            | ExpectWebdriverIO.PartialMatcher
            | ((r: string) => boolean)
    }

    type jsonPrimitive = string | number | boolean | null
    type jsonObject = { [x: string]: jsonPrimitive | jsonObject | jsonArray }
    type jsonArray = Array<jsonPrimitive | jsonObject | jsonArray>
    type JsonCompatible = jsonObject | jsonArray

    interface PartialMatcher {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sample?: any
        $$typeof: symbol
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        asymmetricMatch(...args: any[]): boolean
        toString(): string
    }

    /**
     * expect function declaration, containing two generics:
     *  - T: the type of the actual value, e.g. WebdriverIO.Browser or WebdriverIO.Element
     *  - R: the type of the return value, e.g. Promise<void> or void
     */
    interface Expect {
        <T = unknown, R extends void | Promise<void> = void | Promise<void>>(actual: T): Matchers<R, T>

        /**
         * Creates a soft assertion wrapper around standard expect
         * Soft assertions record failures but don't throw errors immediately
         * All failures are collected and reported at the end of the test
         */
        soft<T = unknown>(actual: T): Matchers<Promise<void>, T>

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

        // Standard asymmetric matchers from Jest
        extend(map: Record<string, Function>): void
        anything(): PartialMatcher
        any(sample: unknown): PartialMatcher
        stringContaining(expected: string): PartialMatcher
        objectContaining(sample: Record<string, unknown>): PartialMatcher
        arrayContaining(sample: Array<unknown>): PartialMatcher
        stringMatching(expected: string | RegExp): PartialMatcher
        not: AsymmetricMatchers
    }

    interface AsymmetricMatchers {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any(expectedObject: any): PartialMatcher
        anything(): PartialMatcher
        arrayContaining(sample: Array<unknown>): PartialMatcher
        objectContaining(sample: Record<string, unknown>): PartialMatcher
        stringContaining(expected: string): PartialMatcher
        stringMatching(expected: string | RegExp): PartialMatcher
        not: AsymmetricMatchers
    }
}

declare module 'expect-webdriverio' {
    export = ExpectWebdriverIO
}
