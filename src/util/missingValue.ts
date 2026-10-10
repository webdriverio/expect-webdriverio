/**
 * A value that does not exist, e.g. no cookie with this name. The matcher compares it as no value (so an asymmetric matcher
 * such as `expect.anything()` does not match it), and the failure message prints its text, `Received: no cookie`, not
 * `null`. It has the brand of the asymmetric matchers of Jest only for the printing: `pretty-format` prints the text of
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
