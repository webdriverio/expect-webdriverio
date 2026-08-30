
import { setDefaultOptions, setFeatureFlags } from 'expect-webdriverio'

// TODO dprevost to review (should we remove it?)
process.env.WDIO_ENABLE_MULTI_REMOTE_ELEMENT_ARRAY = 'true'
process.env.WDIO_ENABLE_MULTI_REMOTE_SELECT = 'true'

export const config: WebdriverIO.MultiremoteConfig = {
    //
    // ====================
    // Runner Configuration
    // ====================
    //
    runner: 'local',
    bail: process.env.CI ? 0 : 1,

    //
    // ==================
    // Specify Test Files
    // ==================
    //
    specs: [
        './test/specs/**/*.test.ts',
        //'./test/specs/**/basic-matchers.test.ts',
        //'./test/specs/**/network-matchers.test.ts',
        //'./test/specs/**/options.test.ts',
        //'./test/specs/**/wdio-matchers.test.ts'
    ],

    maxInstances: 10,

    //
    // ============
    // Multi-Remote Capabilities
    // ============
    //
    capabilities: [{
            chrome: {
                capabilities: {
                    browserName: 'chrome',
                    'goog:chromeOptions': {
                        args: ['headless', 'disable-gpu']
                    }
                }
            },
            firefox: {
                capabilities: {
                    browserName: 'firefox',
                    browserVersion: 'stable', // Required locally to force downloading!
                    'moz:firefoxOptions': {
                        args: ['-headless', 'disable-gpu']
                    }
                }
            },
        }],

    //
    // ===================
    // Test Configurations
    // ===================
    //
    logLevel: 'info',
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
        bail: true
    },

    //
    // =====
    // Hooks
    // =====
    //
    before: function () {
        setDefaultOptions({ wait: 300, interval: 100 })
        setFeatureFlags({
            useToHaveTextStrictMultiElementsCompareStrategy: true,
        })
    },
}
