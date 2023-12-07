declare namespace ExpectWebdriverIO {
    function expect<T = unknown, R extends void | Promise<void> = void | Promise<void>>(
        actual: T
    ): Matchers<R, T>
    function setOptions(options: DefaultOptions): void
    function getConfig(): any

    interface AssertionResult {
        pass: boolean
        message(): string
    }

    const matchers: Record<
        string,
        (
            actual: any,
            ...expected: any[]
        ) => Promise<AssertionResult>
    >

    interface AssertionHookParams {
        /**
         * name of the matcher, e.g. `toHaveText` or `toBeClickable`
         */
        matcherName: keyof Matchers<unknown, unknown>,
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
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         * @deprecated use `expect(el).toHaveAttribute('attribute', expect.stringContaining('...'))` instead
         */
        toHaveAttributeContaining(
            attribute: string,
            contains: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         * @deprecated use `expect(el).toHaveAttr('attribute', expect.stringContaining('...'))` instead
         */
        toHaveAttrContaining(
            attribute: string,
            contains: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
         */
        toHaveClass(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         */
        toHaveElementClass(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * Element's class includes the className.
         * @deprecated since v1.3.1 - use `toHaveElementClassContaining` instead.
         */
        toHaveClassContaining(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * Element's class includes the className.
         * @deprecated use `expect(el).toHaveElementClass(expect.stringContaining('...'))` instead
         */
        toHaveElementClassContaining(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty`
         */
        toHaveElementProperty(
            property: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            value?: any,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveValue(value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getProperty` value
         * Element's value includes the value.
         * @deprecated use `expect(el).toHaveValue(expect.stringContaining('...'))` instead
         */
        toHaveValueContaining(value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

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
         * `WebdriverIO.Element` -> `getAttribute` href
         * Element's href includes the value provided
         * @deprecated use `expect(el).toHaveHref(expect.stringContaining('...'))` instead
         */
        toHaveHrefContaining(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         * Element's href includes the value provided
         * @deprecated use `expect(el).toHaveLink(expect.stringContaining('...'))` instead
         */
        toHaveLinkContaining(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveId(id: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getSize` value
         */
        toHaveSize(id: string | RegExp | ExpectWebdriverIO.PartialMatcher, size: { height: number; width: number }, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getText`
         * Element's text equals the text provided
         */
        toHaveText(
            text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getText`
         * Element's text includes the text provided
         * @deprecated use `expect(el).toHaveText(expect.stringContaining('...'))` instead
         */
        toHaveTextContaining(
            text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getHTML`
         * Element's html equals the html provided
         */
        toHaveHTML(html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options?: ExpectWebdriverIO.HTMLOptions): R
        /**
         * `WebdriverIO.Element` -> `getHTML`
         * Element's html includes the html provided
         * @deprecated use `expect(el).toHaveHTML(expect.stringContaining('...'))` instead
         */
        toHaveHTMLContaining(
            html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.HTMLOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getComputedLabel`
         * Element's computed label equals the computed label provided
         */
        toHaveComputedLabel(
            computedLabel: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getComputedLabel`
         * Element's computed label includes the computed label provided
         * @deprecated use `expect(el).toHaveComputedLabel(expect.stringContaining('...'))` instead
         */
        toHaveComputedLabelContaining(
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
         * `WebdriverIO.Element` -> `getComputedRole`
         * Element's computed role includes the computed role provided
         * @deprecated use `expect(el).toHaveComputedRole(expect.stringContaining('...'))` instead
         */
        toHaveComputedRoleContaining(
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

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getUrl`
         * Browser's url includes the provided text
         * @deprecated use `expect(el).toHaveUrl(expect.stringContaining('...'))` instead
         */
        toHaveUrlContaining(url: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Browser` -> `getTitle`
         */
        toHaveTitle(title: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getTitle`
         * Browser's title includes the provided text
         * @deprecated use `expect(el).toHaveTitle(expect.stringContaining('...'))` instead
         */
        toHaveTitleContaining(title: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Browser` -> `execute`
         */
        toHaveClipboardText(clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `execute`
         * Browser's clipboard includes the provided text
         * @deprecated use `expect(el).toHaveClipboardText(expect.stringContaining('...'))` instead
         */
        toHaveClipboardTextContaining(clipboardText: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R


        // ===== $$ only =====
        /**
         * `WebdriverIO.ElementArray` -> `$$('...').length`
         * supports less / greater then or equals to be passed in options
         */
        toBeElementsArrayOfSize(
            size: number | ExpectWebdriverIO.NumberOptions,
            options?: ExpectWebdriverIO.NumberOptions
        ): R

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
        sample?: any
        $$typeof: symbol
        asymmetricMatch(...args: any[]): boolean
    }
}

declare module 'expect-webdriverio' {
    export = ExpectWebdriverIO
}
