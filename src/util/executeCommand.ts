/**
 * Ensures that the specified condition passes for a given element or every element in an array of elements
 * @param {WebdriverIO.Element | WebdriverIO.ElementArray} el The element or array of elements
 * @param {(el: WebdriverIO.Element | WebdriverIO.ElementArray, ...params: any[]) => Promise<{ result: boolean; value?: any; }>} condition - The condition function to be executed on the element(s). It should return a promise that resolves to an object containing a result boolean and an optional value
 * @param {ExpectWebdriverIO.DefaultOptions} [options={}] - Optional configuration options
 * @param {any[]} [params=[]] - Additional parameters
 * @returns {Promise<{ el: WebdriverIO.Element | WebdriverIO.ElementArray; success: boolean; values: any }>} - An object containing the element(s), a success boolean indicating if the condition passed, and the values returned from the condition function
 */
export async function executeCommand(
    el: WebdriverIO.Element | WebdriverIO.ElementArray,
    condition: (el: WebdriverIO.Element | WebdriverIO.ElementArray, ...params: any[]) => Promise<{
        result: boolean;
        value?: any;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: any[] = []
): Promise<{ el: WebdriverIO.Element | WebdriverIO.ElementArray; success: boolean; values: any; }> {
    const result = await condition(el, ...params, options)
    return {
        el,
        success: result.result === true,
        values: result.value
    }
}
