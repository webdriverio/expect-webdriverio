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

        /**
         * suppress default assertion error, print only user message if it was provided
         */
        suppressDefaultMessage?: boolean
    }

    interface CommandOptions extends DefaultOptions {
        /**
         * user message to prepend before assertion error
         */
        message?: string

        /**
         * same as `{ wait: 0 }`, do not wait for expectation to succeed
         */
        now?: boolean
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
}

declare namespace jest {
    interface Matchers<R, T> {
        /**
         * `WebdriverIO.Element` -> `isDisplayed`
         */
        $toBeDisplayed(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * `WebdriverIO.Element` -> `isDisplayed`
         */
        $toBeVisible(options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        $toExist(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        $toBePresent(options?: ExpectWebdriverIO.CommandOptions): R
        /**
         * `WebdriverIO.Element` -> `isExisting`
         */
        $toBeExisting(options?: ExpectWebdriverIO.CommandOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute`
         */
        $toHaveAttribute(attribute: string, value?: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         */
        $toHaveAttr(attribute: string, value?: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         */
        $toHaveAttributeContaining(attribute: string, contains: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute`
         * Element's attribute includes the value.
         */
        $toHaveAttrContaining(attribute: string, contains: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         */
        $toHaveClass(className: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getAttribute` class
         * Element's class includes the className.
         */
        $toHaveClassContaining(className: string, options?: ExpectWebdriverIO.StringOptions): R

        /**
         * `WebdriverIO.Element` -> `getProperty`
         */
        $toHaveProperty(property: string, value?: any, options?: ExpectWebdriverIO.StringOptions): R

        /**
        * `WebdriverIO.Element` -> `getProperty` value
        */
        $toHaveValue(value: string, options?: ExpectWebdriverIO.StringOptions): R
        /**
         * `WebdriverIO.Element` -> `getProperty` value
         * Element's value includes the value.
         */
        $toHaveValueContaining(value: string, options?: ExpectWebdriverIO.StringOptions): R
    }
}

declare module "expect-webdriverio" {
    export = ExpectWebdriverIO
}
