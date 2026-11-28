import { stripVTControlCharacters } from 'node:util'
import type { MatcherContext } from 'expect'
import type { RawMatcherFn } from '../types.js'
import { MatcherUsageError } from './matcherUsageError.js'

/** The runtime shape of the `CustomMatcher` class of the `expect` package */
type CustomMatcher = {
    sample: unknown[]
    inverse: boolean
    getMatcherContext(): MatcherContext
    asymmetricMatch(other: unknown): boolean
    toAsymmetricMatcher(): string
}

type CustomMatcherFactory = (...sample: unknown[]) => CustomMatcher

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
    !!value && (typeof value === 'object' || typeof value === 'function') && typeof (value as PromiseLike<unknown>).then === 'function'

const toOneLine = (message: string) => stripVTControlCharacters(message)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')

/**
 * `expect.extend()` of the `expect` package also adds each matcher to `expect` and `expect.not` as an asymmetric
 * matcher, e.g. `expect.toBeWithinRange(1, 10)`. That one keeps only `pass`: the diff shows the matcher without its
 * message, and an async matcher returns a promise, so it always fails, and always passes with `.not`.
 */
export function enhanceCustomAsymmetricMatcher(expect: { not: object }, name: string, matcher: RawMatcherFn) {
    for (const target of [expect, expect.not] as Record<string, unknown>[]) {
        const create = target[name]
        if (typeof create !== 'function') {
            continue
        }

        Object.defineProperty(target, name, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: (...sample: unknown[]) => enhance((create as CustomMatcherFactory)(...sample), name, matcher)
        })
    }
}

function enhance(customMatcher: CustomMatcher, name: string, matcher: RawMatcherFn) {
    const printMatcher = customMatcher.toAsymmetricMatcher.bind(customMatcher)
    // Of the last call only: a matcher reused in another assertion must not print a stale message
    let failureMessage: (() => string) | string | undefined

    customMatcher.asymmetricMatch = function (this: CustomMatcher, other: unknown) {
        const result = matcher.call(this.getMatcherContext(), other, ...this.sample)
        if (isPromiseLike(result)) {
            // The matcher is already running: ignore its result, so that it cannot reject unhandled
            Promise.resolve(result).catch(() => {})
            const not = this.inverse ? 'not.' : ''
            throw new MatcherUsageError(
                `expect.${not}${name}() cannot be used as an asymmetric matcher: ${name} is async. Use await expect(value).${not}${name}() instead`
            )
        }

        const pass = this.inverse ? !result.pass : result.pass
        failureMessage = pass ? undefined : result.message
        return pass
    }

    customMatcher.toAsymmetricMatcher = () => {
        let message: string | undefined
        try {
            message = typeof failureMessage === 'function' ? failureMessage() : failureMessage
        } catch {
            // A broken message must not hide the failure: print the matcher only
        }

        const oneLine = typeof message === 'string' ? toOneLine(message) : ''
        return oneLine ? `${printMatcher()} (${oneLine})` : printMatcher()
    }

    return customMatcher
}
