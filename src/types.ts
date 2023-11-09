import type { ElementArray as ElementArrayImport } from 'webdriverio'

export type WdioElementMaybePromise =
    WebdriverIO.Element | WebdriverIO.ElementArray |
    Promise<WebdriverIO.Element> | Promise<WebdriverIO.ElementArray>

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace WebdriverIO {
        interface ElementArray extends ElementArrayImport {}
    }
}
