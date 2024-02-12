export type WdioElementMaybePromise =
    WebdriverIO.Element | WebdriverIO.ElementArray |
    Promise<WebdriverIO.Element> | Promise<WebdriverIO.ElementArray>
