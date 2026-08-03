
import { join } from 'node:path'
import type { VisualServiceOptions } from '@wdio/visual-service'
import { SoftAssertionService, setDefaultOptions, setFeatureFlags, setOptions } from 'expect-webdriverio'

export const config: WebdriverIO.MultiremoteConfig = {
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
        // TODO renable other test when multi-remote is supported
        //'./test/specs/**/*.test.ts',
        './test/specs/**/basic-matchers.test.ts',
        //'./test/specs/**/visual-snapshot.test.ts'
        //'./test/specs/**/soft-expect.test.ts',
        //'./test/specs/**/snapshot.test.ts'
        //'./test/specs/**/wdio-matchers.test.ts'
        './test/specs/**/network-matchers.test.ts'
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
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
        [SoftAssertionService, {}],
        [
            'visual',
            {
                baselineFolder: join(process.cwd(), 'visual-snapshot/baseline'),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), 'visual-snapshot/.temp'),
                savePerInstance: true,
                autoSaveBaseline: true,
                compareOptions: {
                    // Block out the changing elements
                    blockOutStatusBar: true,
                    blockOutToolBar: true
                }
            } satisfies VisualServiceOptions
        ]
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    before: function (_capabilities, _specs) {
        setOptions({ wait: 250 })
        setDefaultOptions({ wait: 250 })
        setFeatureFlags({})
    },
}
