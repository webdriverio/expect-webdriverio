import { Capabilities } from "@wdio/types";

export const config: Capabilities.WebdriverIOConfig = {
    //
    // ============
    // Capabilities
    // ============
    //
    capabilities:{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu']
        },
        'wdio-ics:options': {
            logName: 'chrome-jest'
        }
    },
    logLevel: 'info',
}
