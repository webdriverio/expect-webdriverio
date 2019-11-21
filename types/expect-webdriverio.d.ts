declare namespace ExpectWebdriverIO {
    function setOptions(options: Options): void

    interface Options {
        /**
         * time in ms to wait for expectation to succeed. Default: 3000
         */
        wait?: number

        /**
         * interval between attempts. Default: 100
         */
        interval?: number

        /**
         * user message to prepend before assertion error
         */
        message?: string

        /**
         * suppress default assertion error, print only user message if it was provided
         */
        suppressDefaultMessage?: boolean
    }
}

declare namespace jest {
    interface Matchers<R, T> {
        /**
         * `WebdriverIO.Element` -> `isDisplayed`
         */
        $toBeDisplayed(options?: ExpectWebdriverIO.Options): R
    }
}

declare module "expect-webdriverio" {
    export = ExpectWebdriverIO
}
