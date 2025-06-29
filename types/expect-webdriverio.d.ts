/* eslint-disable @typescript-eslint/consistent-type-imports*/
type ServiceInstance =  import('@wdio/types').Services.ServiceInstance
type Test = import('@wdio/types').Frameworks.Test
type TestResult = import('@wdio/types').Frameworks.TestResult
type PickleStep = import('@wdio/types').Frameworks.PickleStep
type Scenario = import('@wdio/types').Frameworks.Scenario

type SnapshotResult = import('@vitest/snapshot').SnapshotResult
type SnapshotUpdateState = import('@vitest/snapshot').SnapshotUpdateState

type ChainablePromiseElement = import('webdriverio').ChainablePromiseElement
type ChainablePromiseArray = import('webdriverio').ChainablePromiseArray

type ExpectLibAsymmetricMatchers = import('expect').AsymmetricMatchers
type ExpectLibAsymmetricMatcher<T> = import('expect').AsymmetricMatcher<T>
type ExpectLibBaseExpect = import('expect').BaseExpect
type ExpectLibMatchers<R extends void | Promise<void>, T> = import('expect').Matchers<R, T>
type ExpectLibExpect = import('expect').Expect

// TODO dprevost: a suggestion would be to move any code outside of the namespace to separate types.ts file, so that we can import the types.

// To remove when exportable from 'expect'. See https://github.com/jestjs/jest/pull/15704 (already merged)
type Inverse<M> = {
    /**
     * Inverse next matcher. If you know how to test something, `.not` lets you test its opposite.
     */
    not: M;
}

/**
 * Real Promise and wdio chainable promise types.
 */
type WdioPromiseLike<T = unknown> = PromiseLike<T> | ChainablePromiseElement | ChainablePromiseArray
type ElementPromise = Promise<WebdriverIO.Element>
type ElementArrayPromise = Promise<WebdriverIO.ElementArray>

/**
 * Only Wdio real promise
 */
type WdioOnlyPromiseLike = ElementPromise | ElementArrayPromise | ChainablePromiseElement | ChainablePromiseArray

/**
 * Only wdio real promise or potential promise usage on element or element array or browser
 */
type WdioOnlyMaybePromiseLike = ElementPromise | ElementArrayPromise | ChainablePromiseElement | ChainablePromiseArray | WebdriverIO.Browser | WebdriverIO.Element | WebdriverIO.ElementArray

// TODO dprevost - check if custom matchers (https://webdriver.io/docs/custommatchers/) will still work aka webdriverio/expect-webdriverio#1408

/**
 * Note we are defining Matchers outside of the namespace as done in jest library until we can make every typing work correctly.
 * Once we have all types working, we could check to bring those back into the `ExpectWebdriverIO` namespace.
 */

/**
 * Type helpers to be able to targets specific types mostly user in conjunctions with the Type of the `actual` parameter of the `expect`
 */
type ElementOrArrayLike = ElementLike | ElementArrayLike
type ElementLike = WebdriverIO.Element | ChainablePromiseElement
type ElementArrayLike = WebdriverIO.ElementArray | ChainablePromiseArray
type MockPromise = Promise<WebdriverIO.Mock>

/**
 * Type helpers allowing to use the function when the expect(actual: T) is of the expected type T.
 */
type FnWhenBrowser<ActualT, Fn> = ActualT extends WebdriverIO.Browser ? Fn : never
type FnWhenMock<ActualT, Fn> = ActualT extends MockPromise ? Fn : never
type FnWhenElementOrArrayLike<ActualT, Fn> = ActualT extends ElementOrArrayLike ? Fn : never
type FnWhenElementArrayLike<ActualT, Fn> = ActualT extends ElementArrayLike ? Fn : never

/**
 * Matchers dedicated to Wdio Browser.
 * When asserting on a browser's properties requiring to be awaited, the return type is a Promise.
 * When actual is not a browser, the return type is never, so the function cannot be used.
 */
interface WdioBrowserMatchers<R, ActualT = unknown>{
    /**
     * `WebdriverIO.Browser` -> `getUrl`
     */
    toHaveUrl: FnWhenBrowser<ActualT, (url: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Browser` -> `getTitle`
     */
    toHaveTitle: FnWhenBrowser<ActualT, (title: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Browser` -> `execute`
     */
    toHaveClipboardText: FnWhenBrowser<ActualT, (clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>, options?: ExpectWebdriverIO.StringOptions) => Promise<R>>
}

/**
 * Matchers dedicated to Network Mocking.
 * When asserting we wait for the result with `await waitUntil()`, therefore the return type needs to be a Promise.
 * When actual is not a WebdriverIO.Mock, the return type is never, so the function cannot be used.
 */
interface WdioNetworkMatchers<R, ActualT = unknown> {
    /**
     * Check that `WebdriverIO.Mock` was called
     */
    toBeRequested: FnWhenMock<ActualT, (options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>
    /**
     * Check that `WebdriverIO.Mock` was called N times
     */
    toBeRequestedTimes: FnWhenMock<ActualT, (times: number | ExpectWebdriverIO.NumberOptions, options?: ExpectWebdriverIO.NumberOptions) => Promise<R>>

    /**
     * Check that `WebdriverIO.Mock` was called with the specific parameters
     */
    toBeRequestedWith: FnWhenMock<ActualT, (requestedWith: ExpectWebdriverIO.RequestedWith, options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>
}

/**
 * Matchers dedicated to WebdriverIO Element or ElementArray (or chainable).
 * When asserting on an element or element array's properties requiring to be awaited, the return type is a Promise.
 * When actual is neither of WebdriverIO.Element, WebdriverIO.ElementArray, ChainableElement, ChainableElementArray, the return type is never, so the function cannot be used.
 */
interface WdioElementOrArrayMatchers<R, ActualT = unknown> {
    // ===== $ or $$ =====
    /**
     * `WebdriverIO.Element` -> `isDisplayed`
     */
    toBeDisplayed: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toExist: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBePresent: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isExisting`
     */
    toBeExisting: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttribute: FnWhenElementOrArrayLike<ActualT, (
        attribute: string, value?: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions)
    => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute`
     */
    toHaveAttr: FnWhenElementOrArrayLike<ActualT, (
        attribute: string, value?: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute` class
     * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
     */
    toHaveClass: FnWhenElementOrArrayLike<ActualT, (
        className: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

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
    toHaveElementClass: FnWhenElementOrArrayLike<ActualT, (
        className: string | RegExp | Array<string | RegExp> | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getProperty`
     */
    toHaveElementProperty: FnWhenElementOrArrayLike<ActualT, (
        property: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        value?: unknown,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveValue: FnWhenElementOrArrayLike<ActualT, (
        value: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isClickable`
     */
    toBeClickable: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `!isEnabled`
     */
    toBeDisabled: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isDisplayedInViewport`
     */
    toBeDisplayedInViewport: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isEnabled`
     */
    toBeEnabled: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isFocused`
     */
    toBeFocused: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeSelected: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `isSelected`
     */
    toBeChecked: FnWhenElementOrArrayLike<ActualT, (options?: ExpectWebdriverIO.StringOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `$$('./*').length`
     * supports less / greater then or equals to be passed in options
     */
    toHaveChildren: FnWhenElementOrArrayLike<ActualT, (
        size?: number | ExpectWebdriverIO.NumberOptions,
        options?: ExpectWebdriverIO.NumberOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveHref: FnWhenElementOrArrayLike<ActualT, (
        href: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute` href
     */
    toHaveLink: FnWhenElementOrArrayLike<ActualT, (
        href: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getProperty` value
     */
    toHaveId: FnWhenElementOrArrayLike<ActualT, (
        id: string | RegExp | ExpectWebdriverIO.PartialMatcher<string>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getSize` value
     */
    toHaveSize: FnWhenElementOrArrayLike<ActualT, (
        size: { height: number; width: number },
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

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
    toHaveText: FnWhenElementOrArrayLike<ActualT, (
        text: string | RegExp | ExpectWebdriverIO.PartialMatcher<string> | Array<string | RegExp | ExpectWebdriverIO.PartialMatcher<string>>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getHTML`
     * Element's html equals the html provided
     */
    toHaveHTML: FnWhenElementOrArrayLike<ActualT, (
        html: string | RegExp | ExpectWebdriverIO.PartialMatcher<string> | Array<string | RegExp>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getComputedLabel`
     * Element's computed label equals the computed label provided
     */
    toHaveComputedLabel: FnWhenElementOrArrayLike<ActualT, (
        computedLabel: string | RegExp | ExpectWebdriverIO.PartialMatcher<ActualT>| Array<string | RegExp>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getComputedRole`
     * Element's computed role equals the computed role provided
     */
    toHaveComputedRole: FnWhenElementOrArrayLike<ActualT, (
        computedRole: string | RegExp | ExpectWebdriverIO.PartialMatcher<ActualT>| Array<string | RegExp>,
        options?: ExpectWebdriverIO.StringOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getSize('width')`
     * Element's width equals the width provided
     */
    toHaveWidth: FnWhenElementOrArrayLike<ActualT, (width: number, options?: ExpectWebdriverIO.CommandOptions) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getSize('height')` or `getSize()`
     * Checks if the element's height equals the given number, or its size equals the given object.
     *
     * @param heightOrSize - Either a number (height) or an object with height and width.
     * @param options - Optional command options.
     *
     * **Usage Example:**
     * ```js
     * await expect(element).toHaveHeight(42)
     * await expect(element).toHaveHeight({ height: 42, width: 42 })
     * ```
     */
    toHaveHeight: FnWhenElementOrArrayLike<ActualT, (
        heightOrSize: number | { height: number; width: number },
        options?: ExpectWebdriverIO.CommandOptions
    ) => Promise<R>>

    /**
     * `WebdriverIO.Element` -> `getAttribute("style")`
     */
    toHaveStyle: FnWhenElementOrArrayLike<ActualT, (style: { [key: string]: string }, options?: ExpectWebdriverIO.StringOptions) => Promise<R>>
}

/**
 * Matchers dedicated to WebdriverIO ElementArray (or its chainable).
 * When asserting on each element's properties requiring awaiting, then return type is a Promise.
 * When actual is not of WebdriverIO.ElementArray nor ChainableElementArray, the return type is never, so the function cannot be used.
 */
interface WdioElementArrayOnlyMatchers<R, ActualT = unknown> {
    // ===== $$ only =====
    /**
     * `WebdriverIO.ElementArray` -> `$$('...').length`
     * supports less / greater then or equals to be passed in options
     */
    toBeElementsArrayOfSize: FnWhenElementArrayLike<ActualT, (
        size: number | ExpectWebdriverIO.NumberOptions,
        options?: ExpectWebdriverIO.NumberOptions
    ) => Promise<R> & Promise<WebdriverIO.ElementArray>>
}

/**
 * Matchers supporting basic snapshot tests as well as DOM snapshot testing.
 * When the actual is a WebdriverIO.Element, we need to await the `outerHTML` therefore the return type is a Promise.
 *
 * ⚠️ these matchers overload the similar matchers from jest-expect library.
 * Therefore, they also need to be redefined in the jest.d.ts file so correctly overload the matchers from the Jest namespace.
 * @see jest.d.ts
 *
 * TODO dprevost: Review for better typings...
 */
interface WdioJestOverloadedMatchers<R, ActualT> {
    /**
     * snapshot matcher
     * @param label optional snapshot label
     */
    toMatchSnapshot(label?: string): ActualT extends WdioPromiseLike ? Promise<R> : R;
    /**
     * inline snapshot matcher
     * @param snapshot snapshot string (autogenerated if not specified)
     * @param label optional snapshot label
     */
    toMatchInlineSnapshot(snapshot?: string, label?: string): ActualT extends WdioPromiseLike ? Promise<R> : R;
}

/**
 * All the specific WebDriverIO only matchers, excluding the generic matchers from the expect library.
 */
type WdioCustomMatchers<R, ActualT> = WdioJestOverloadedMatchers<R, ActualT> & WdioBrowserMatchers<R, ActualT> & WdioElementOrArrayMatchers<R, ActualT> & WdioElementArrayOnlyMatchers<R, ActualT> & WdioNetworkMatchers<R, ActualT>

/**
 * All the matchers that WebdriverIO Library supports including the generic matchers from the expect library.
 */
type WdioMatchers<R extends void | Promise<void>, ActualT> = WdioCustomMatchers<R, ActualT> & ExpectLibMatchers<R, ActualT>

type WdioMatchersAndInverse<R extends void | Promise<void>, ActualT> = WdioMatchers<R, ActualT> & Inverse<WdioMatchers<R, ActualT>>

/**
 * Expects specific to WebdriverIO, excluding the generic expect matchers.
 */
interface WdioCustomExpect extends ExpectLibBaseExpect {
    /**
     * Creates a soft assertion wrapper around standard expect
     * Soft assertions record failures but don't throw errors immediately
     * All failures are collected and reported at the end of the test
     */
    soft<T = unknown>(actual: T): T extends PromiseLike<unknown> ? ExpectWebdriverIO.MatchersAndInverse<Promise<void>, T> : ExpectWebdriverIO.MatchersAndInverse<void, T>;

    /**
     * Get all current soft assertion failures
     */
    getSoftFailures(testId?: string): ExpectWebdriverIO.SoftFailure[]

    /**
     * Manually assert all soft failures (throws an error if any failures exist)
     */
    assertSoftFailures(testId?: string): void

    /**
     * Clear all current soft assertion failures
     */
    clearSoftFailures(testId?: string): void
}

/**
 * Expects supported by the expect-webdriverio library, including the generic expect matchers.
 */
type WdioExpect = WdioCustomExpect & ExpectLibExpect

/**
 * Asymmetric matchers supported by the expect-webdriverio library.
 * The type is the same as the one from the expect library, but we need to redefine it to have it available in the `ExpectWebdriverIO` namespace.
 */
type WdioAsymmetricMatchers = ExpectLibAsymmetricMatchers

/**
 * Implementation of the asymmetric matcher. Equivalent as the PartialMatcher but with sample used by implementations.
 * For the runtime but not the typing.
 */
type WdioAsymmetricMatcher<R> = ExpectWebdriverIO.PartialMatcher<R> & {
    // Overwrite protected properties of expect.AsymmetricMatcher to access them
    sample: R;
}

declare namespace ExpectWebdriverIO {
    function setOptions(options: DefaultOptions): void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function getConfig(): any

    /** expect lib type/interface override to have everything under the ExpectWebDriverIO namespace */
    /**
     * Supported Matchers for expect-webdriverio.
     * The Type T (ActualT) needs to keep it's name to overload the Matchers from the expect library.
     */
    interface Matchers<R extends void | Promise<void>, T> extends WdioMatchers<R, T> {}

    type MatchersAndInverse<R extends void | Promise<void>, ActualT> = ExpectWebdriverIO.Matchers<R, ActualT> & Inverse<ExpectWebdriverIO.Matchers<R, ActualT>>

    /**
     * Overloaded from `expect` library to allow using the `ExpectWebdriverIO` namespace to define custom asymmetric matchers.
     */
    type AsymmetricMatchers = WdioAsymmetricMatchers
    interface Expect extends AsymmetricMatchers, WdioExpect {
        /**
         * The `expect` function is used every time you want to test a value.
         * You will rarely call `expect` by itself.
         *
         * expect function declaration contains two generics:
         *  - T: the type of the actual value, e.g. any type, not just WebdriverIO.Browser or WebdriverIO.Element
         *  - R: the type of the return value, e.g. Promise<void> or void
         *
         * Note: The function must stay here in the namespace to overwrite correctly the expect function from the expect library.
         *
         * @param actual The value to apply matchers against.
         */
        <T = unknown>(actual: T): ExpectWebdriverIO.MatchersAndInverse<void, T>;
    }

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
        constructor(serviceOptions?: SoftAssertionServiceOptions, capabilities?: unknown, config?: any)
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

    // TODO dprevost: what is this, I'm unable to find it in the codebase, was a function before, seems to override something from Jasmine in the past?
    // const matchers: Map<
    //     string,
    //     (
    //         actual: unknown,
    //         ...expected: unknown[]
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
            | ((postData: string | undefined) => boolean)
        response?:
            | string
            | ExpectWebdriverIO.JsonCompatible
            | ExpectWebdriverIO.PartialMatcher<string | ExpectWebdriverIO.JsonCompatible>
            | ((response: unknown) => boolean)
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

    // interface AsymmetricMatchers extends WdioAsymmetricMatchers {}
    //TODO dprevost: ensure we do not break custom AsymmetricMatchers from expect library
    // declare global {
    //   namespace ExpectWebdriverIO {
    //     interface AsymmetricMatchers {
    //       myCustomMatcher(value: string): ExpectWebdriverIO.PartialMatcher;
    //     }
    //   }
    // }
}

declare module 'expect-webdriverio' {
    export = ExpectWebdriverIO
}
