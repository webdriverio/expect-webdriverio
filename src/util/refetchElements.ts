import { getConfig } from '../options'

const config: SomeExpectLib["_expectWebdriverio"] = getConfig()
const { options: DEFAULT_OPTIONS } = config

/**
 * refetch elements array
 * @param elements WebdriverIO.ElementArray
 */
export const refetchElements = async (elements: WebdriverIO.ElementArray, wait = DEFAULT_OPTIONS.wait, full = false): Promise<any> => {
    if (elements) {
        if (wait > 0 && (elements.length === 0 || full)) {
            // @ts-ignore
            elements = (await elements.parent[elements.foundWith](elements.selector, ...elements.props) as WebdriverIO.ElementArray)
        }
    }
    return elements
}
