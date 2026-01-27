
import { SoftAssertionService, setOptions } from 'expect-webdriverio'

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
        './test/specs/**/*.test.ts'
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
        [SoftAssertionService, {}]
    ],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },

    //
    // =====
    // Hooks
    // =====
    //
    before: function (_capabilities, _specs) {
        setOptions({ wait: 500 })
    },
}
