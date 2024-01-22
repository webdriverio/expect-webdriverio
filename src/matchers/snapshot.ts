import path from 'node:path'
import type { AssertionError } from 'node:assert'

import { expect } from '../index.js'
import { SnapshotService } from '../snapshot.js'

interface InlineSnapshotOptions {
    inlineSnapshot: string
    error: Error
}

/**
 * Vitest snapshot client returns a snapshot error with an `actual` and `expected`
 * property containing strings of the compared snapshots. In case these don't match
 * we use this helper method to return a proper assertion message that contains
 * nice color highlighting etc. For that we just re-assert the two strings.
 * @param snapshotError error message from snapshot client
 * @returns matcher result
 */
function returnSnapshotError (snapshotError: AssertionError) {
    /**
     * wrap into another try catch block so we can get a better
     * assertion message
     */
    try {
        expect(snapshotError.actual).toBe(snapshotError.expected)
    } catch (e) {
        return {
            pass: false,
            message: () => (e as Error).message
        }
    }

    /**
     * this should never happen but in case it does we want to
     */
    throw snapshotError
}

/**
 * Helper method to assert snapshots
 * @param received element to snapshot
 * @param message  optional message on failure
 * @returns matcher results
 */
function toMatchSnapshotAssert (received: unknown, message: string, inlineOptions?: InlineSnapshotOptions) {
    const snapshotService = SnapshotService.initiate()
    try {
        snapshotService.client.assert({
            received,
            message,
            filepath: snapshotService.currentFilePath,
            name: snapshotService.currentTestName,
            /**
             * apply inline options if needed
             */
            ...(inlineOptions ? {
                ...inlineOptions,
                isInline: true
            } : {
                isInline: false
            })
        })
        return {
            pass: true,
            message: () => 'Snapshot matches'
        }
    } catch (e: unknown) {
        return returnSnapshotError(e as AssertionError)
    }
}

/**
 * Asynchronous version of `toMatchSnapshot` that works with WebdriverIO elements.
 * @param elem    a WebdriverIO element
 * @param message optional message on failure
 * @returns matcher results
 */
async function toMatchSnapshotAsync (asyncReceived: unknown, message: string, inlineOptions?: InlineSnapshotOptions) {
    let received: WebdriverIO.Element | unknown = await asyncReceived

    if (received && typeof received === 'object' && 'elementId' in received) {
        received = await (received as WebdriverIO.Element).getHTML(true)
    }
    return toMatchSnapshotAssert(received, message, inlineOptions)
}

/**
 * We want to keep this method synchronous so that doing snapshots for basic
 * elements doesn't require an `await` and matches other framework behavior.
 * @param received element to snapshot
 * @param message  optional message on failure
 * @returns matcher results
 */
function toMatchSnapshotHelper(received: unknown, message: string, inlineOptions?: InlineSnapshotOptions) {
    const snapshotService = SnapshotService.initiate()
    if (!snapshotService.currentFilePath || !snapshotService.currentTestName) {
        throw new Error('Snapshot service is not initialized')
    }

    /**
     * allow to match DOM snapshots
     */
    if (
        received && typeof received === 'object' &&
        (
            'elementId' in received ||
            'then' in received
        )
    ) {
        return toMatchSnapshotAsync(received, message, inlineOptions)
    }

    return toMatchSnapshotAssert(received, message, inlineOptions)
}

export function toMatchSnapshot(received: unknown, message: string) {
    return toMatchSnapshotHelper(received, message)
}

export function toMatchInlineSnapshot(received: unknown, inlineSnapshot: string, message: string) {
    /**
     * When running component/unit tests in the browser we receive a stack trace
     * through the `this` scope.
     */
    const browserErrorStack: string = this.errorStack

    function __INLINE_SNAPSHOT__(inlineSnapshot: string, message: string) {
        /**
         * create a error object to pass along that helps Vitest's snapshot manager
         * to infer the stack trace and locate the inline snapshot
         */
        const error = new Error('inline snapshot')

        /**
         * merge stack traces from browser and node
         */
        if (browserErrorStack && error.stack) {
            error.stack = [
                ...error.stack.split('\n').slice(0, 3),
                ...browserErrorStack
                    .split('\n')
                    .slice(2)
                    .map((line) => line
                        /**
                         * stack traces within the browser have an url path, e.g.
                         * `http://localhost:8080/@fs/path/to/__tests__/unit/snapshot.test.js:123:45`
                         * that we want to remove so that the stack trace is properly
                         * parsed by Vitest, e.g. make it to:
                         * `/__tests__/unit/snapshot.test.js:123:45`
                         */
                        .replace(/http:\/\/localhost:\d+/g, '')
                        .replace('/@fs/', '/')
                    )
            ].join('\n');
        }
        error.stack = error.stack?.split('\n').filter((line) => (
            line.includes('__INLINE_SNAPSHOT__') ||
            !(
                line.includes('__EXTERNAL_MATCHER_TRAP__') ||
                line.includes(`expect-webdriverio${path.sep}lib${path.sep}matchers${path.sep}snapshot.js:`)
            )
        )).join('\n')
        return toMatchSnapshotHelper(received, message, {
            inlineSnapshot,
            error
        })
    }
    return __INLINE_SNAPSHOT__(inlineSnapshot, message)
}
