
import { setOptions } from 'expect-webdriverio'

export const config: WebdriverIO.Config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',

    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        // './test/specs/**/*.test.ts',
        // './test/specs/expectWdioImport/basic-matchers.test.ts',
        // './test/specs/expectWdioImport/wdio-matchers.test.ts'
        './test/specs/globalImport/jasmine-specific.test.ts',
    ],

    //
    // ============
    // Capabilities
    // ============
    //
    maxInstances: 10,
    capabilities: [{
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--headless', '--disable-gpu']
        },
        'wdio-ics:options': {
            logName: 'chrome-jasmine'
        }
    }],

    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
            // SoftAssertionService is not supported since anyway Jasmine is designed that way out of the box
            // visual snapshot service does not work properly with Jasmine due to the lack of proper hooks
    ],
    framework: 'jasmine',
    reporters: ['spec'],
    jasmineOpts: {
        defaultTimeoutInterval: 60000
    },

    //
    // =====
    // Hooks
    // =====
    //
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    before: function (_capabilities, _specs) {
        setOptions({ wait: 500 })
    },
}
