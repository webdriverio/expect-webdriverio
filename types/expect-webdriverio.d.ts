declare namespace ExpectWebdriverIO {
    function expect<T = unknown, R extends void | Promise<void> = void | Promise<void>>(
        actual: T
    ): Matchers<R, T>
    function setOptions(options: DefaultOptions): void
    function getConfig(): any
    const matchers: Record<
        string,
        (
            actual: any,
            ...expected: any[]
        ) => Promise<{
            pass: boolean
            message(): string
        }>
    >

    interface DefaultOptions {
        /**
         * time in ms to wait for expectation to succeed. Default: 3000
         */
        wait?: number

        /**
         * interval between attempts. Default: 100
         */
        interval?: number
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
         */
        toHaveAttributeContaining(
            attribute: string,
            contains: string | RegExp | ExpectWebdriverIO.PartialMatcher,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
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
         * @deprecated since v1.3.1 - use `toHaveElementClassContaining` instead.
         * Element's class includes the className.
         */
        toHaveClassContaining(className: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * Element's class includes the className.
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
         */
        toHaveHrefContaining(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         * Element's href includes the value provided
         */
        toHaveLinkContaining(href: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveId(id: string | RegExp | ExpectWebdriverIO.PartialMatcher, options?: ExpectWebdriverIO.StringOptions): R

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
