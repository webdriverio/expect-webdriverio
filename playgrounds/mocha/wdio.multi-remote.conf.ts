import { join } from 'node:path'
import type { VisualServiceOptions } from '@wdio/visual-service'
import { setDefaultOptions } from 'expect-webdriverio'

export const config: WebdriverIO.MultiRemoteConfig = {
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
        './test/multi-remote-specs/**/*.test.ts',
        //'./test/multi-remote-specs/**/basic-matchers.test.ts',
        //'./test/multi-remote-specs/**/network-matchers.test.ts',
        //'./test/multi-remote-specs/**/options.test.ts',
        //'./test/multi-remote-specs/**/wdio-matchers.test.ts'
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
                        args: ['headless', 'disable-gpu'],

                        // Required to allow clipboard access in headless mode, scoped to the origins used by the tests
                        prefs: {
                            'profile.content_settings.exceptions.clipboard': {
                                '[*.]localhost,*': { setting: 1 },
                                'https://guinea-pig.webdriver.io:443,*': { setting: 1 }
                            }
                        }
                    },
                    'wdio-ics:options': {
                        logName: 'chrome-multi-remote'
                    }
                }
            },
            firefox: {
                capabilities: {
                    browserName: 'firefox',
                    browserVersion: 'stable', // Required locally to force downloading!
                    'moz:firefoxOptions': {
                        args: ['-headless', 'disable-gpu']
                    },
                    'wdio-ics:options': {
                        logName: 'firefox-multi-remote'
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
    services: [
        [
            'visual',
            {
                // Not committed: each run saves the baselines, so that every OS compares its own screenshots
                baselineFolder: join(process.cwd(), 'visual-snapshot/multi-remote/baseline'),
                formatImageName: '{tag}-{logName}-{width}x{height}',
                screenshotPath: join(process.cwd(), 'visual-snapshot/multi-remote/.temp'),
                savePerInstance: true,
                autoSaveBaseline: true,
                compareOptions: {
                    // Block out the changing elements
                    blockOutStatusBar: true,
                    blockOutToolBar: true,
                    // Firefox on Windows can draw the edges of the same text differently between two page loads
                    ignoreAntialiasing: true
                }
            } satisfies VisualServiceOptions
        ]
    ],
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
        setDefaultOptions({ wait: 1000, interval: 100 })
    },
}
