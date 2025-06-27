/// <reference types="./expect-webdriverio.d.ts"/>

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

declare global {

    // TODO dprevost might need to override the Array too (and more?)
    function expect<T>(actual: T): jasmine.Matchers<T>

    // function expectAsync<T, U>(actual: T | PromiseLike<T>): jasmine.AsyncMatchers<T, U>
    namespace expect {

        // TODO should we use expectAsync here instead?
        /** Wdio soft assertion */
        /**
         * Creates a soft assertion wrapper around standard expect
         * Soft assertions record failures but don't throw errors immediately
         * All failures are collected and reported at the end of the test
         */
        function soft<T>(actual: T): jasmine.Matchers<T>
        // soft<T = unknown>(actual: T): T extends PromiseLike ? Matchers<Promise<void>, T> : Matchers<void, T>

        /**
         * Get all current soft assertion failures
         */
        function getSoftFailures(testId?: string): ExpectWebdriverIO.SoftFailure[]

        /**
         * Manually assert all soft failures (throws an error if any failures exist)
         */
        function assertSoftFailures(testId?: string): void

        /**
         * Clear all current soft assertion failures
         */
        function clearSoftFailures(testId?: string): void

        /** Expect Asymmetric Matchers */
        // function any(sample: unknown): AsyncMatcher
        // function anything(): AsyncMatcher
        // function arrayContaining(sample: Array<unknown>): AsyncMatcher
        // function arrayOf(sample: unknown): AsyncMatcher
        // function closeTo(sample: number, precision?: number): AsyncMatcher
        // function objectContaining(sample: Record<string, unknown>): AsyncMatcher
        // function stringContaining(sample: string): AsyncMatcher
        // function stringMatching(sample: string | RegExp): AsyncMatcher
    }

    namespace expectAsync {

        // TODO should we use expectAsync here instead?
        /** Wdio soft assertion */
        /**
         * Creates a soft assertion wrapper around standard expect
         * Soft assertions record failures but don't throw errors immediately
         * All failures are collected and reported at the end of the test
         */
        function soft<T>(actual: T): jasmine.Matchers<T>
        // soft<T = unknown>(actual: T): T extends PromiseLike ? Matchers<Promise<void>, T> : Matchers<void, T>

        /**
         * Get all current soft assertion failures
         */
        function getSoftFailures(testId?: string): ExpectWebdriverIO.SoftFailure[]

        /**
         * Manually assert all soft failures (throws an error if any failures exist)
         */
        function assertSoftFailures(testId?: string): void

        /**
         * Clear all current soft assertion failures
         */
        function clearSoftFailures(testId?: string): void

        /** Expect Asymmetric Matchers */
        // function any(sample: unknown): AsyncMatcher
        // function anything(): AsyncMatcher
        // function arrayContaining(sample: Array<unknown>): AsyncMatcher
        // function arrayOf(sample: unknown): AsyncMatcher
        // function closeTo(sample: number, precision?: number): AsyncMatcher
        // function objectContaining(sample: Record<string, unknown>): AsyncMatcher
        // function stringContaining(sample: string): AsyncMatcher
        // function stringMatching(sample: string | RegExp): AsyncMatcher
    }
}

export {}