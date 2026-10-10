/**
 * A value that does not exist, e.g. no cookie with this name. It never matches an expected value, also not an asymmetric
 * matcher that accepts no value (`expect.not.stringContaining()`), and the failure message prints its text,
 * `Received: no cookie`, not `null`. It has the brand of the asymmetric matchers of Jest only for the printing: `pretty-format` prints the text of
 * `toAsymmetricMatcher()` without quotes.
 */
export class MissingValue {
    readonly $$typeof = Symbol.for('jest.asymmetricMatcher')

    constructor(private readonly text: string) {}

    /** A missing value is never equal to an expected value */
    asymmetricMatch(): boolean {
        return false
    }

    toAsymmetricMatcher(): string {
        return this.text
    }
}
