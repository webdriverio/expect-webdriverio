import type { WdioElements } from '../types.js'

/**
 * Ensures that the specified condition passes for a given element or every element in an array of elements
 * @param el The element or array of elements
 * @param condition - The condition function to be executed on the element(s).
 * @param options - Optional configuration options
 * @param params - Additional parameters
 */
export async function executeCommand(
    el: WebdriverIO.Element | WdioElements,
    condition: (el: WebdriverIO.Element | WdioElements, ...params: unknown[]) => Promise<{
        result: boolean;
        value?: unknown;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: unknown[] = []
): Promise<{ el: WebdriverIO.Element | WdioElements; success: boolean; values: unknown; }> {
    const result = await condition(el, ...params, options)
    return {
        el,
        success: result.result === true,
        values: result.value
    }
}
