/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const wrapExpectedWithArray = (el: WebdriverIO.Element | WebdriverIO.ElementArray, actual: unknown, expected: unknown) => {
    if (Array.isArray(el) && el.length > 1 && Array.isArray(actual)) {
        expected = [expected]
    }
    return expected
}
