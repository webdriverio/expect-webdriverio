/**
 * A wrong use of a matcher, e.g. a list matcher on one element. Waiting cannot make it correct, so `waitUntil()` throws
 * it at once, without a retry until the end of `wait`.
 */
export class MatcherUsageError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'MatcherUsageError'
    }
}
