import type { AssertionError } from 'node:assert'

import { expect } from 'expect'
import { stripSnapshotIndentation } from '@vitest/snapshot'
import { SnapshotService } from '../snapshot.js'
import { awaitElementOrArray, isElementOrArrayOrMultiRemoteElementLike, isMultiRemoteElement, isMultiRemoteElementArray, isStrictlyElementArray } from '../util/elementsUtil.js'
import { getElementsPerInstance } from '../util/multiRemoteUtils.js'
import { filterInlineSnapshotStack } from '../util/stackUtil.js'
import type { WdioMultiRemoteElementArray, WdioMatcherContext } from '../types.js'

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
            filepath: snapshotService.currentFilePath as string,
            name: snapshotService.currentTestName as string,
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
 * Elements to snapshot as their outerHTML, the same ones as element matchers, except an empty plain array: holding no
 * element to recognize, it stays a regular value, so that it keeps being snapshotted synchronously.
 */
const isElementsToSnapshot = (received: unknown): boolean => {
    const isEmptyPlainArray = Array.isArray(received) && received.length === 0 && !isStrictlyElementArray(received) && !isMultiRemoteElementArray(received)
    return isElementOrArrayOrMultiRemoteElementLike(received) && !isEmptyPlainArray
}

const getOuterHTML = (element: WebdriverIO.Element) => element.getHTML({ includeSelectorTag: true })

/**
 * The outerHTML shared by every instance, like without multi-remote, else one outerHTML per instance, keyed by instance
 * name (sorted, whatever the instances order or the snapshotFormat).
 */
const getMultiRemoteOuterHTML = async (multiRemoteElements: WebdriverIO.MultiRemoteElement | WdioMultiRemoteElementArray) => {
    const isSingleElement = isMultiRemoteElement(multiRemoteElements)
    if (!isSingleElement && multiRemoteElements.length === 0) {
        // An empty `MultiRemoteElementArray`, found on no instance
        return []
    }
    const instances = [...(isSingleElement ? multiRemoteElements.instances : multiRemoteElements.parent.instances)].sort()
    const elementsPerInstance = isSingleElement ? undefined : getElementsPerInstance(multiRemoteElements, instances)
    const htmlPerInstance: Record<string, unknown> = Object.fromEntries(await Promise.all(instances.map(async (instance) => [
        instance,
        elementsPerInstance
            ? await Promise.all(elementsPerInstance[instance].map(getOuterHTML))
            : await getOuterHTML((multiRemoteElements as WebdriverIO.MultiRemoteElement).getInstance(instance))
    ])))
    const htmls = Object.values(htmlPerInstance)
    return htmls.every((html) => JSON.stringify(html) === JSON.stringify(htmls[0])) ? htmls[0] : htmlPerInstance
}

/**
 * Asynchronous version of `toMatchSnapshot` that works with WebdriverIO elements.
 * @param elem    a WebdriverIO element
 * @param message optional message on failure
 * @returns matcher results
 */
async function toMatchSnapshotAsync (asyncReceived: unknown, message: string, inlineOptions?: InlineSnapshotOptions) {
    // Awaited first to also support any other thenable, e.g. an element command result
    const { element, elements, multiRemoteSelector, other } = await awaitElementOrArray(await asyncReceived)

    let received: unknown = other
    if (multiRemoteSelector) {
        received = await getMultiRemoteOuterHTML(multiRemoteSelector)
    } else if (elements && isMultiRemoteElementArray(elements)) {
        received = await getMultiRemoteOuterHTML(elements)
    } else if (elements) {
        // Array.from() to also snapshot an `ElementArray` as a plain array
        received = await Promise.all(Array.from(elements as WebdriverIO.Element[]).map(getOuterHTML))
    } else if (element) {
        received = await getOuterHTML(element)
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
            'then' in received ||
            isElementsToSnapshot(received)
        )
    ) {
        return toMatchSnapshotAsync(received, message, inlineOptions)
    }

    return toMatchSnapshotAssert(received, message, inlineOptions)
}

export function toMatchSnapshot(received: unknown, message: string) {
    return toMatchSnapshotHelper(received, message)
}

export function toMatchInlineSnapshot(this: WdioMatcherContext, received: unknown, inlineSnapshot: string, message: string) {
    /**
     * When running component/unit tests in the browser we receive a stack trace
     * through the `this` scope.
     */
    const browserErrorLine = this.errorStack

    function __INLINE_SNAPSHOT__(inlineSnapshot: string, message: string) {
        /**
         * create a error object to pass along that helps Vitest's snapshot manager
         * to infer the stack trace and locate the inline snapshot
         */
        const error = new Error('inline snapshot')

        /**
         * merge stack traces from browser and node and push the error of the test
         * into the stack trace
         */
        if (browserErrorLine && error.stack) {
            const stack = error.stack.split('\n')
            error.stack = [
                ...stack.slice(0, 4),
                browserErrorLine,
                ...stack.slice(3)
            ].join('\n')
        }
        const trace = error.stack ? filterInlineSnapshotStack(error.stack) : []

        /**
         * tweak the stack trace to enable inline snapshot testing within this projects
         * unit tests
         */
        if (process.env.WDIO_INTERNAL_TEST) {
            trace.splice(2, 1)
        }

        if (inlineSnapshot) {
            inlineSnapshot = stripSnapshotIndentation(inlineSnapshot)
        }

        error.stack = trace.join('\n')
        return toMatchSnapshotHelper(received, message, {
            inlineSnapshot,
            error
        })
    }
    return __INLINE_SNAPSHOT__(inlineSnapshot, message)
}
