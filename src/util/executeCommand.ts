/**
 * make sure that condition passes for element or every element of elements array
 * @param el element or elements array
 * @param condition
 */
export async function executeCommand(
    el: WebdriverIO.Element,
    condition: (el: WebdriverIO.Element, ...params: any[]) => Promise<{
        result: boolean;
        value?: any;
    }>,
    options: ExpectWebdriverIO.DefaultOptions = {},
    params: any[] = []
) {
    const { isNot = false } = this
    const result = await condition(el, ...params, options)
    const success = (result.result === isNot) === true
    return {
        el,
        success,
        values: result.value
    }
}
