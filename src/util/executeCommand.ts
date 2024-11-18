/**
 * Ensures that the specified condition passes for a given element or every element in an array of elements
 * @param el The element or array of elements
 * @param condition - The condition function to be executed on the element(s).
 * @param options - Optional configuration options
 * @param params - Additional parameters
 */
export async function executeCommand(
    el: WebdriverIO.Element | WebdriverIO.ElementArray,
    condition: (el: WebdriverIO.Element | WebdriverIO.ElementArray, ...params: unknown[]) => Promise<{
        result: boolean;
        value?: unknown;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: unknown[] = []
): Promise<{ el: WebdriverIO.Element | WebdriverIO.ElementArray; success: boolean; values: unknown; }> {
    const result = await condition(el, ...params, options)
    return {
        el,
        success: result.result === true,
        values: result.value
    }
}
