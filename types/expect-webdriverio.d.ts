declare namespace ExpectWebdriverIO {
    function setOptions(options: DefaultOptions): void

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
         * `WebdriverIO.Element` -> `isDisplayed`
         */
        toBeVisible(options?: ExpectWebdriverIO.CommandOptions): R

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
        toHaveAttribute(attribute: string, value?: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         */
        toHaveAttr(attribute: string, value?: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         */
        toHaveAttributeContaining(
            attribute: string,
            contains: string,
            options?: ExpectWebdriverIO.StringOptions
        ): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         */
        toHaveAttrContaining(
            attribute: string,
            contains: string,
            options?: ExpectWebdriverIO.StringOptions
        ): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * @deprecated since v1.3.1 - use `toHaveElementClass` instead.
         */
        toHaveClass(className: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         */
        toHaveElementClass(className: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * @deprecated since v1.3.1 - use `toHaveElementClassContaining` instead.
         * Element's class includes the className.
         */
        toHaveClassContaining(className: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * Element's class includes the className.
         */
        toHaveElementClassContaining(className: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty`
         * @deprecated since v1.3.1 - use `toHaveElementProperty` instead.
         */
        toHaveProperty(property: string, value?: any, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty`
         */
        toHaveElementProperty(property: string, value?: any, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveValue(value: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getProperty` value
         * Element's value includes the value.
         */
        toHaveValueContaining(value: string, options?: ExpectWebdriverIO.StringOptions): R

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
         * `WebdriverIO.Element` -> `isDisplayedInViewport`
         */
        toBeVisibleInViewport(options?: ExpectWebdriverIO.StringOptions): R

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
        toHaveHref(href: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         */
        toHaveLink(href: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         * Element's href includes the value provided
         */
        toHaveHrefContaining(href: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` href
         * Element's href includes the value provided
         */
        toHaveLinkContaining(href: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty` value
         */
        toHaveId(id: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getText`
         */
        toHaveText(text: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getText`
         * Element's text includes the text provided
         */
        toHaveTextContaining(text: string, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getUrl`
         */
        toHaveUrl(url: string, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getUrl`
         * Browser's url includes the provided text
         */
        toHaveUrlContaining(url: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Browser` -> `getTitle`
         */
        toHaveTitle(title: string, options?: ExpectWebdriverIO.StringOptions): R

        // ===== browser only =====
        /**
         * `WebdriverIO.Browser` -> `getTitle`
         * Browser's title includes the provided text
         */
        toHaveTitleContaining(title: string, options?: ExpectWebdriverIO.StringOptions): R

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
        statusCode?: number | Array<number>,
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
        asymmetricMatch?(...args: any[]): boolean
    }
}

declare module 'expect-webdriverio' {
    export = ExpectWebdriverIO
}
