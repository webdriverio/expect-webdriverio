
import { setDefaultOptions, setFeatureFlags } from 'expect-webdriverio'

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
        //'./test/specs/**/network-matchers.test.ts'
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
                    browserVersion: 'stable',
                    'goog:chromeOptions': {
                        args: ['headless', 'disable-gpu']
                    }
                }
            },
            firefox: {
                capabilities: {
                    browserName: 'firefox',
                    browserVersion: 'stable',
                    'moz:firefoxOptions': {
                        args: ['-headless']
                    }
                }
            },
            chromium: {
                capabilities: {
                    browserName: 'chromium',
                    browserVersion: 'latest',
                    'goog:chromeOptions': {
                        args: ['headless','disable-gpu']
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
        setDefaultOptions({ wait: 250 })
        setFeatureFlags({
            useToHaveTextStrictMultiElementsCompareStrategy: true,
        })
    },
}
