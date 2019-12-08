/**
 * if el is an array of elements and actual value is an array
 * wrap expected value with array
 * @param el element
 * @param actual actual result or results array
 * @param expected expected result
 */
export const wrapExpectedWithArray = (el: WebdriverIO.Element | WebdriverIO.ElementArray, actual: any, expected: any) => {
    if (Array.isArray(el) && el.length > 1 && Array.isArray(actual)) {
        expected = [expected]
    }
    return expected
}

/**
 * update the received elements array
 * @param success   if `true` - perform update
 * @param received
 * @param el
 * @param full      if `true` - update the received elements array even if it's not empty.
 */
export const updateElementsArray = (
    success: boolean,
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    refetched: WebdriverIO.Element | WebdriverIO.ElementArray,
    full = false) => {
    // do nothing if not success
    if (!success) {
        return
    }

    // only update element array
    if (Array.isArray(received) && Array.isArray(refetched)) {
        // remove every item of original element array
        if (full === true) {
            while (received.length > 0) {
                received.pop()
            }
        }

        // add every refetched item to original element array
        if (received.length === 0) {
            refetched.forEach(el => received.push(el))
        }
    }
}
